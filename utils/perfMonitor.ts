import { logger } from '@/utils/logger';

type ScreenMetrics = {
  renders: number;
  focuses: number;
  blurs: number;
  totalFocusedMs: number;
  lastFocusStartedAt: number | null;
};

type Snapshot = {
  uptimeMs: number;
  api: {
    totalRequests: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  };
  screens: Record<
    string,
    {
      renders: number;
      focuses: number;
      blurs: number;
      totalFocusedMs: number;
      isFocused: boolean;
    }
  >;
};

const MAX_ENDPOINTS_IN_SNAPSHOT = 10;

const state: {
  startedAt: number;
  apiTotalRequests: number;
  apiByEndpoint: Record<string, number>;
  screenByName: Record<string, ScreenMetrics>;
} = {
  startedAt: Date.now(),
  apiTotalRequests: 0,
  apiByEndpoint: {},
  screenByName: {},
};

function ensureScreen(screenName: string): ScreenMetrics {
  if (!state.screenByName[screenName]) {
    state.screenByName[screenName] = {
      renders: 0,
      focuses: 0,
      blurs: 0,
      totalFocusedMs: 0,
      lastFocusStartedAt: null,
    };
  }
  return state.screenByName[screenName];
}

function normalizeEndpoint(url: string): string {
  const noHost = url.replace(/^https?:\/\/[^/]+/i, '');
  const noQuery = noHost.split('?')[0] ?? '/';
  return noQuery.trim() || '/';
}

function toSnapshot(): Snapshot {
  const now = Date.now();
  const topEndpoints = Object.entries(state.apiByEndpoint)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_ENDPOINTS_IN_SNAPSHOT)
    .map(([endpoint, count]) => ({ endpoint, count }));

  const screens = Object.entries(state.screenByName).reduce<Snapshot['screens']>((acc, [name, metrics]) => {
    const focusedExtra = metrics.lastFocusStartedAt ? now - metrics.lastFocusStartedAt : 0;
    acc[name] = {
      renders: metrics.renders,
      focuses: metrics.focuses,
      blurs: metrics.blurs,
      totalFocusedMs: metrics.totalFocusedMs + focusedExtra,
      isFocused: metrics.lastFocusStartedAt !== null,
    };
    return acc;
  }, {});

  return {
    uptimeMs: now - state.startedAt,
    api: {
      totalRequests: state.apiTotalRequests,
      topEndpoints,
    },
    screens,
  };
}

export const perfMonitor = {
  markRender(screenName: string): void {
    if (!__DEV__) {
      return;
    }
    ensureScreen(screenName).renders += 1;
  },

  markFocus(screenName: string): void {
    if (!__DEV__) {
      return;
    }

    const metrics = ensureScreen(screenName);
    metrics.focuses += 1;
    metrics.lastFocusStartedAt = Date.now();
  },

  markBlur(screenName: string): void {
    if (!__DEV__) {
      return;
    }

    const metrics = ensureScreen(screenName);
    metrics.blurs += 1;

    if (metrics.lastFocusStartedAt) {
      metrics.totalFocusedMs += Date.now() - metrics.lastFocusStartedAt;
      metrics.lastFocusStartedAt = null;
    }
  },

  trackApiRequest(method?: string, url?: string): void {
    if (!__DEV__) {
      return;
    }

    const safeMethod = (method ?? 'GET').toUpperCase();
    const safeEndpoint = normalizeEndpoint(url ?? '/unknown');
    const key = `${safeMethod} ${safeEndpoint}`;

    state.apiTotalRequests += 1;
    state.apiByEndpoint[key] = (state.apiByEndpoint[key] ?? 0) + 1;
  },

  logSnapshot(label = 'snapshot'): void {
    if (!__DEV__) {
      return;
    }

    logger.info(`[PerfMonitor] ${label}`, toSnapshot());
  },

  reset(label = 'reset'): void {
    if (!__DEV__) {
      return;
    }

    state.startedAt = Date.now();
    state.apiTotalRequests = 0;
    state.apiByEndpoint = {};
    state.screenByName = {};
    logger.info(`[PerfMonitor] ${label}`);
  },
};