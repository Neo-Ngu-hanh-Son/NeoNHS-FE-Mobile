const MAP_CONSTANTS = {
  CHECKINPOINT_DETECT_RADIUS_M: 20, // Radius to detect nearby check-in points (UI)
  FETCH_CHECKIN_RADIUS_M: 100, // Default radius for fetching nearby check-in points (For proximity check)
  DISTANCE_LIMIT_BEFORE_REFETCH_M: 20,
  // Radius to consider user is "on" the step for navigation guidance
  STEP_RADIUS_M: 10,

  // The minimum time interval between user location updates to prevent excessive re-renders and computations
  UPDATE_USER_LOCATION_THROTTLE_MS: 1500,
}

export default MAP_CONSTANTS;