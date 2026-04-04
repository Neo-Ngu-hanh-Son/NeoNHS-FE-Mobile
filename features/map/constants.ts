const MAP_CONSTANTS = {
  CHECKINPOINT_DETECT_RADIUS_M: 20, // Radius to detect nearby check-in points (UI)
  FETCH_CHECKIN_RADIUS_M: 100, // Default radius for fetching nearby check-in points (For proximity check)
  DISTANCE_LIMIT_BEFORE_REFETCH_M: 20,

  // Radius to consider user is "on" the step for navigation guidance
  STEP_RADIUS_M: 30,
  ARRIVAL_RADIUS_M: 10, // Radius to consider user has arrived at the destination

  // The minimum time interval between user location updates to prevent excessive re-renders and computations
  UPDATE_USER_LOCATION_THROTTLE_MS: 1500,

  ADVANCE_THRESHOLD_M: 0.5, // The distance in meters threshold for advancing to the next step

  GOOGLE_MAP_STYLE: [
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'poi',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'road',
      elementType: 'labels.icon',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
    {
      featureType: 'transit',
      stylers: [
        {
          visibility: 'off',
        },
      ],
    },
  ],
};

export default MAP_CONSTANTS;
