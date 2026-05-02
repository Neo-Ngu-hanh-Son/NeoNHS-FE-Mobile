import { useState, useEffect, useMemo, useRef } from 'react';
import { LatLng } from 'react-native-maps';
import * as turf from '@turf/turf';
import { decodeRoutePolyline } from '../../utils/helpers';
import { MapViewMode } from '../../store/useMapStore';
import { RouteResponse } from '../../types';

interface UseDynamicPolylineProps {
  userLocation?: { latitude: number; longitude: number } | null;
  animationIntervalMs?: number; // How fast the snake draws
  enableDynamicSlicing?: boolean; // Allows turning off the "consumption" feature
  enableAnimation?: boolean; // Allows turning off the animation
  isFetching: boolean;
  viewMode: MapViewMode;
  routeSummary?: RouteResponse | null;
}

export const useDynamicPolyline = ({
  userLocation,
  animationIntervalMs = 15,
  enableDynamicSlicing = true,
  enableAnimation = true,
  isFetching,
  viewMode,
  routeSummary
}: UseDynamicPolylineProps) => {
  const encodedPolyline = routeSummary?.routes?.[0]?.polyline?.encodedPolyline;

  const memorizedEncodedPolyline = useMemo(() => {
    if (viewMode === 'EXPLORING') return '';
    return encodedPolyline ?? '';
  }, [encodedPolyline, viewMode]);

  const [animatedCoordinates, setAnimatedCoordinates] = useState<LatLng[]>([]);
  const [isDrawingRoute, setIsDrawingRoute] = useState(false);

  // Use a ref to store the animation frame ID so we can cancel it cleanly
  const animationFrameRef = useRef<number | null>(null);

  const fullPath = useMemo(() => {
    if (!memorizedEncodedPolyline) return [];
    return decodeRoutePolyline(memorizedEncodedPolyline);
  }, [memorizedEncodedPolyline]);

  useEffect(() => {
    // 1. Cleanup previous animations if the route changes
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (!enableAnimation || fullPath.length === 0) {
      setAnimatedCoordinates(fullPath);
      setIsDrawingRoute(false);
      return;
    }

    // NO animation unless preview mode
    if (viewMode !== 'PREVIEWING_NAVIGATION') {
      setAnimatedCoordinates(fullPath);
      setIsDrawingRoute(false);
      return;
    }

    // 2. UX Safety: Skip animation for massive city routes
    if (fullPath.length > 800) {
      console.log('🛣️ Route is massive, skipping animation for instant UX.');
      setAnimatedCoordinates(fullPath);
      setIsDrawingRoute(false);
      return;
    }

    setIsDrawingRoute(true);
    let currentIndex = 1;
    let currentCoords = [fullPath[0]];

    // Set initial state
    setAnimatedCoordinates(currentCoords);

    // Dynamic chunking: Ensure animation always takes roughly 0.5s,
    // regardless of whether the path is 50 points or 500 points.
    const pointsPerFrame = Math.max(1, Math.floor(fullPath.length / 30));

    // 3. The 60FPS Native Frame Loop
    const drawNextFrame = () => {
      if (currentIndex < fullPath.length) {
        const nextChunk = fullPath.slice(currentIndex, currentIndex + pointsPerFrame);
        currentCoords = [...currentCoords, ...nextChunk]; // Mutate local variable

        setAnimatedCoordinates(currentCoords); // Update React state
        currentIndex += pointsPerFrame;

        // Request the next frame
        animationFrameRef.current = requestAnimationFrame(drawNextFrame);
      } else {
        setIsDrawingRoute(false);
      }
    };

    // Kick off the animation
    animationFrameRef.current = requestAnimationFrame(drawNextFrame);

    // Cleanup on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fullPath, enableAnimation]);

  // 3. The Slicing / Display Logic
  const displayCoordinates = useMemo(() => {
    if (isFetching) return [];
    // Show animation if running, OR if we disabled slicing, just return the animated/full path
    if (isDrawingRoute || !enableDynamicSlicing || !userLocation) {
      return animatedCoordinates.length > 0 ? animatedCoordinates : fullPath;
    }

    if (fullPath.length < 2) return fullPath;

    try {
      const userPoint = turf.point([userLocation.longitude, userLocation.latitude]);
      const line = turf.lineString(fullPath.map((p) => [p.longitude, p.latitude]));

      const snapped = turf.nearestPointOnLine(line, userPoint);
      const endPoint = turf.point([fullPath[fullPath.length - 1].longitude, fullPath[fullPath.length - 1].latitude]);

      const sliced = turf.lineSlice(snapped, endPoint, line);

      return sliced.geometry.coordinates.map((coord) => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
    } catch (error) {
      // Fallback just in case Turf.js fails on a mathematical anomaly
      console.warn('⚠️ [useDynamicPolyline] Turf slicing failed, falling back to full path', error);
      return fullPath;
    }
  }, [isDrawingRoute, animatedCoordinates, fullPath, userLocation, enableDynamicSlicing]);

  return {
    displayCoordinates,
    isDrawingRoute,
    fullPath,
  };
};
