import { consoleTransport, logger as RNLogger } from "react-native-logs";

export const logger = RNLogger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: __DEV__ ? "debug" : "error",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "white",
      warn: "yellowBright",
      error: "redBright",
      debug: "blue",
    },
  },
});