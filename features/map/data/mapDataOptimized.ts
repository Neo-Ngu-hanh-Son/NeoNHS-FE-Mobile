export type RenderRoute = {
  id: string;
  coordinates: { latitude: number; longitude: number }[];
};

// Predefined render routes for polylines on the map
export const renderRoutes: RenderRoute[] = [
  // ==========================
  // KHU A - MAIN STAIRCASE
  // ==========================
  {
    id: 'R_A_MAIN_STAIRCASE',
    coordinates: [
      { latitude: 16.002819, longitude: 108.26247 },
      { latitude: 16.003125, longitude: 108.262384 },
      { latitude: 16.003166, longitude: 108.262306 },
      { latitude: 16.003339, longitude: 108.262177 },
      { latitude: 16.003439, longitude: 108.262188 },
      { latitude: 16.003445, longitude: 108.262226 },
      { latitude: 16.003555, longitude: 108.262293 },
      { latitude: 16.003633, longitude: 108.262277 },
      { latitude: 16.003679, longitude: 108.262336 },
      { latitude: 16.003651, longitude: 108.262467 },
    ],
  },

  // ==========================
  // KHU A - LEFT BRANCH (TO NGA 3)
  // ==========================
  {
    id: 'R_A_LEFT_BRANCH',
    coordinates: [
      { latitude: 16.003651, longitude: 108.262467 },
      { latitude: 16.003721, longitude: 108.262491 },
      { latitude: 16.003744, longitude: 108.262424 },
      { latitude: 16.003736, longitude: 108.262376 },
      { latitude: 16.003754, longitude: 108.262295 },
    ],
  },

  // ==========================
  // KHU A - RIGHT ROAD (DUONG DI)
  // ==========================
  {
    id: 'R_A_RIGHT_DUONG_DI',
    coordinates: [
      { latitude: 16.003754, longitude: 108.262295 },
      { latitude: 16.003891, longitude: 108.262156 },
      { latitude: 16.003893, longitude: 108.262092 },
      { latitude: 16.004017, longitude: 108.262081 },
      { latitude: 16.004014, longitude: 108.261987 },
      { latitude: 16.003911, longitude: 108.26199 },
      { latitude: 16.003886, longitude: 108.261966 },
      { latitude: 16.003886, longitude: 108.261901 },
      { latitude: 16.00402, longitude: 108.26185 },
      { latitude: 16.003996, longitude: 108.261622 },
      { latitude: 16.004066, longitude: 108.26144 },
    ],
  },

  // ==========================
  // KHU A - LEFT PATH (THAP NGAM)
  // ==========================
  {
    id: 'R_A_LEFT_THAP_NGAM',
    coordinates: [
      { latitude: 16.003754, longitude: 108.262295 },
      { latitude: 16.003697, longitude: 108.262242 },
      { latitude: 16.003654, longitude: 108.262177 },
      { latitude: 16.003592, longitude: 108.262169 },
      { latitude: 16.003556, longitude: 108.262135 },
    ],
  },

  // ==========================
  // KHU A - UP BRANCH TO NGA TU
  // ==========================
  {
    id: 'R_A_UP_TO_NGA_TU',
    coordinates: [
      { latitude: 16.003651, longitude: 108.262467 },
      { latitude: 16.003723, longitude: 108.262583 },
      { latitude: 16.003821, longitude: 108.262714 },
      { latitude: 16.003896, longitude: 108.26265 },
      { latitude: 16.004071, longitude: 108.262867 },
    ],
  },

  // ==========================
  // NGA TU -> NGA 2 (LEFT)
  // ==========================
  {
    id: 'R_NGATU_TO_NGA2_LEFT',
    coordinates: [
      { latitude: 16.004071, longitude: 108.262867 },
      { latitude: 16.004081, longitude: 108.26272 },
      { latitude: 16.004091, longitude: 108.262571 },
    ],
  },

  // ==========================
  // NGA 2 -> CAVE ENTRANCE
  // ==========================
  {
    id: 'R_NGA2_CAVE_ENTRANCE',
    coordinates: [
      { latitude: 16.004091, longitude: 108.262571 },
      { latitude: 16.004184, longitude: 108.262342 },
      { latitude: 16.004217, longitude: 108.262284 },
    ],
  },

  // ==========================
  // CAVE SPLIT (UP / LEFT)
  // ==========================
  {
    id: 'R_CAVE_UP_CHECKIN',
    coordinates: [
      { latitude: 16.004217, longitude: 108.262284 },
      { latitude: 16.004293, longitude: 108.262261 },
    ],
  },

  {
    id: 'R_CAVE_LEFT_CHECKIN',
    coordinates: [
      { latitude: 16.004217, longitude: 108.262284 },
      { latitude: 16.004212, longitude: 108.262248 },
      { latitude: 16.004299, longitude: 108.262208 },
    ],
  },

  // ==========================
  // NGA 2 UPPER PATH (TO STAIR + LOOP POINT)
  // ==========================
  {
    id: 'R_NGA2_UPPER_MAIN',
    coordinates: [
      { latitude: 16.004081, longitude: 108.26272 },
      { latitude: 16.004214, longitude: 108.262645 },
    ],
  },

  {
    id: 'R_NGA2_UPPER_LEFT_STAIR_END',
    coordinates: [
      { latitude: 16.004214, longitude: 108.262645 },
      { latitude: 16.004307, longitude: 108.262589 },
      { latitude: 16.004334, longitude: 108.26232 },
    ],
  },

  {
    id: 'R_NGA2_UPPER_RIGHT_LOOP',
    coordinates: [
      { latitude: 16.004307, longitude: 108.262589 },
      { latitude: 16.00446, longitude: 108.262742 },
      { latitude: 16.004462, longitude: 108.262821 },
      { latitude: 16.004511, longitude: 108.262847 },
    ],
  },

  {
    id: 'R_NGA2_UPPER_UP_LOOP',
    coordinates: [
      { latitude: 16.004214, longitude: 108.262645 },
      { latitude: 16.00428, longitude: 108.262686 },
      { latitude: 16.004352, longitude: 108.262774 },
      { latitude: 16.004462, longitude: 108.262821 },
    ],
  },

  // ==========================
  // NGA TU -> UPPER NGA 3
  // ==========================
  {
    id: 'R_NGATU_TO_UPPER_NGA3',
    coordinates: [
      { latitude: 16.004071, longitude: 108.262867 },
      { latitude: 16.004167, longitude: 108.262937 },
    ],
  },

  // ==========================
  // UPPER NGA 3 -> LINH NHAM CAVE
  // ==========================
  {
    id: 'R_UPPER_NGA3_LINH_NHAM',
    coordinates: [
      { latitude: 16.004167, longitude: 108.262937 },
      { latitude: 16.004164, longitude: 108.263022 },
      { latitude: 16.0042103, longitude: 108.2630874 },
    ],
  },

  // ==========================
  // UPPER NGA 3 -> STAIR ENTRANCE MAIN
  // ==========================
  {
    id: 'R_UPPER_NGA3_TO_STAIR_ENTRANCE',
    coordinates: [
      { latitude: 16.004167, longitude: 108.262937 },
      { latitude: 16.004203, longitude: 108.262899 },
      { latitude: 16.004246, longitude: 108.26288 },
      { latitude: 16.004298, longitude: 108.262883 },
      { latitude: 16.004342, longitude: 108.262907 },
      { latitude: 16.004396, longitude: 108.262985 },
    ],
  },

  // ==========================
  // STAIR ENTRANCE -> END POINT
  // ==========================
  {
    id: 'R_STAIR_ENTRANCE_TO_END',
    coordinates: [
      { latitude: 16.004396, longitude: 108.262985 },
      { latitude: 16.00445, longitude: 108.26299 },
      { latitude: 16.004496, longitude: 108.263068 },
    ],
  },

  // ==========================
  // STAIR ENTRANCE -> TOILET PATH
  // ==========================
  {
    id: 'R_STAIR_ENTRANCE_TO_TOILET',
    coordinates: [
      { latitude: 16.00445, longitude: 108.26299 },
      { latitude: 16.004507, longitude: 108.262842 },
      { latitude: 16.004538, longitude: 108.262872 },
      { latitude: 16.0046067, longitude: 108.2627529 },
    ],
  },

  // ==========================
  // STAIR ENTRANCE -> LONG LOOP PATH BACK TO N_16.004406_108.263146
  // ==========================
  {
    id: 'R_STAIR_ENTRANCE_LOOP_BACK',
    coordinates: [
      { latitude: 16.004538, longitude: 108.262872 },
      { latitude: 16.004594, longitude: 108.262947 },
      { latitude: 16.004686, longitude: 108.263041 },
      { latitude: 16.004674, longitude: 108.263046 },
      { latitude: 16.004659, longitude: 108.263127 },
      { latitude: 16.004637, longitude: 108.263166 },
      { latitude: 16.004522, longitude: 108.263175 },
      { latitude: 16.004406, longitude: 108.263146 },
    ],
  },

  // ==========================
  // STAIR VIEWPOINT PATH
  // ==========================
  {
    id: 'R_STAIR_VIEWPOINT_PATH',
    coordinates: [
      { latitude: 16.004406, longitude: 108.263146 },
      { latitude: 16.004375, longitude: 108.263218 },
      { latitude: 16.004332, longitude: 108.26325 },
      { latitude: 16.004337, longitude: 108.263333 },
      { latitude: 16.004417, longitude: 108.263427 },
      { latitude: 16.004375, longitude: 108.263481 },
      { latitude: 16.004311, longitude: 108.263497 },
      { latitude: 16.004277, longitude: 108.263532 },
    ],
  },

  // ==========================
  // NGA TU -> RIGHT BRIDGE PATH (KHU A EXIT)
  // ==========================
  {
    id: 'R_NGATU_TO_BRIDGE',
    coordinates: [
      { latitude: 16.004071, longitude: 108.262867 },
      { latitude: 16.004046, longitude: 108.263024 },
      { latitude: 16.004032, longitude: 108.263109 },
      { latitude: 16.00403, longitude: 108.263188 },
      { latitude: 16.004012, longitude: 108.263264 },
      { latitude: 16.003988, longitude: 108.263333 },
      { latitude: 16.003961, longitude: 108.263397 },
      { latitude: 16.003945, longitude: 108.263473 },
      { latitude: 16.003933, longitude: 108.263522 },
      { latitude: 16.003912, longitude: 108.263566 },
    ],
  },

  // ==========================
  // VAN THONG CAVE DOWN PATH (LOOP)
  // ==========================
  {
    id: 'R_VAN_THONG_DOWN_LOOP',
    coordinates: [
      { latitude: 16.003912, longitude: 108.263566 },
      { latitude: 16.003828, longitude: 108.263528 },
      { latitude: 16.003792, longitude: 108.263524 },
      { latitude: 16.003747, longitude: 108.263542 },
      { latitude: 16.003702, longitude: 108.263553 },
      { latitude: 16.003653, longitude: 108.263543 },
      { latitude: 16.003611, longitude: 108.26353 },
      { latitude: 16.003557, longitude: 108.26352 },
      { latitude: 16.003506, longitude: 108.263498 },
      { latitude: 16.003487, longitude: 108.263475 },
      { latitude: 16.003484, longitude: 108.263438 },
      { latitude: 16.003517, longitude: 108.263408 },
      { latitude: 16.00356, longitude: 108.263384 },
      { latitude: 16.003602, longitude: 108.263366 },
      { latitude: 16.003652, longitude: 108.263366 },
      { latitude: 16.00366, longitude: 108.263383 },
      { latitude: 16.003658, longitude: 108.263424 },
    ],
  },

  // ==========================
  // DOWN ROUTE FROM NGA 2 (TO LEFT END)
  // ==========================
  {
    id: 'R_NGA2_DOWN_LEFT_END',
    coordinates: [
      { latitude: 16.004046, longitude: 108.263024 },
      { latitude: 16.004039, longitude: 108.263024 },
      { latitude: 16.004003, longitude: 108.263029 },
      { latitude: 16.003959, longitude: 108.263024 },
      { latitude: 16.003901, longitude: 108.263015 },
      { latitude: 16.003861, longitude: 108.263009 },
      { latitude: 16.003826, longitude: 108.263026 },
      { latitude: 16.003809, longitude: 108.263035 },
      { latitude: 16.003778, longitude: 108.263126 },
      { latitude: 16.003776, longitude: 108.263198 },
      { latitude: 16.003825, longitude: 108.263233 },
      { latitude: 16.003844, longitude: 108.263307 },
      { latitude: 16.003842, longitude: 108.26334 },
      { latitude: 16.003833, longitude: 108.263375 },
      { latitude: 16.00386, longitude: 108.263395 },
      { latitude: 16.003888, longitude: 108.263403 },
      { latitude: 16.003911, longitude: 108.263417 },
    ],
  },

  {
    id: 'R_NGA2_DOWN_LEFT_BRANCH',
    coordinates: [
      { latitude: 16.003911, longitude: 108.263417 },
      { latitude: 16.003919, longitude: 108.26339 },
      { latitude: 16.003936, longitude: 108.263353 },
    ],
  },

  {
    id: 'R_NGA2_DOWN_RIGHT_LOOP',
    coordinates: [
      { latitude: 16.003911, longitude: 108.263416 },
      { latitude: 16.003912, longitude: 108.263442 },
      { latitude: 16.003872, longitude: 108.263471 },
      { latitude: 16.003839, longitude: 108.263496 },
      { latitude: 16.003788, longitude: 108.263502 },
      { latitude: 16.003758, longitude: 108.263504 },
      { latitude: 16.003723, longitude: 108.26349 },
      { latitude: 16.003673, longitude: 108.263463 },
      { latitude: 16.003654, longitude: 108.263451 },
      { latitude: 16.003644, longitude: 108.263432 },
      { latitude: 16.003658, longitude: 108.263424 },
    ],
  },

  // ==========================
  // KHU A RIGHT BRANCH (SMALL STAIR PATH)
  // ==========================
  {
    id: 'R_A_RIGHT_BRANCH',
    coordinates: [
      { latitude: 16.003651, longitude: 108.262467 },
      { latitude: 16.003651, longitude: 108.262652 },
      { latitude: 16.003592, longitude: 108.262735 },
      { latitude: 16.003584, longitude: 108.262765 },
      { latitude: 16.003623, longitude: 108.262875 },
      { latitude: 16.00369, longitude: 108.262963 },
    ],
  },

  // ==========================
  // KHU B MAIN PATH
  // ==========================
  {
    id: 'R_B_MAIN_PATH',
    coordinates: [
      { latitude: 16.003273, longitude: 108.264639 },
      { latitude: 16.003527, longitude: 108.264683 },
      { latitude: 16.003691, longitude: 108.264655 },
      { latitude: 16.00385, longitude: 108.264581 },
      { latitude: 16.003892, longitude: 108.264463 },
      { latitude: 16.004003, longitude: 108.264472 },
      { latitude: 16.004116, longitude: 108.264484 },
    ],
  },

  // ==========================
  // KHU B RIGHT LOOP
  // ==========================
  {
    id: 'R_B_RIGHT_LOOP',
    coordinates: [
      { latitude: 16.004116, longitude: 108.264484 },
      { latitude: 16.004109, longitude: 108.264556 },
      { latitude: 16.004265, longitude: 108.264569 },
      { latitude: 16.004313, longitude: 108.264573 },
      { latitude: 16.004322, longitude: 108.264452 },
      { latitude: 16.004119, longitude: 108.264422 },
    ],
  },

  // ==========================
  // KHU B CONTINUE TO NEXT JUNCTION
  // ==========================
  {
    id: 'R_B_TO_NEXT_JUNCTION',
    coordinates: [
      { latitude: 16.004119, longitude: 108.264422 },
      { latitude: 16.004058, longitude: 108.264412 },
      { latitude: 16.004062, longitude: 108.264362 },
    ],
  },

  // ==========================
  // KHU B LEFT BRANCH TO CAVE
  // ==========================
  {
    id: 'R_B_LEFT_BRANCH_TO_CAVE',
    coordinates: [
      { latitude: 16.004062, longitude: 108.264362 },
      { latitude: 16.00408, longitude: 108.26424 },
      { latitude: 16.004104, longitude: 108.264219 },
    ],
  },

  // ==========================
  // KHU B UP CAVE PATH
  // ==========================
  {
    id: 'R_B_UP_CAVE_PATH',
    coordinates: [
      { latitude: 16.004104, longitude: 108.264219 },
      { latitude: 16.004182, longitude: 108.264223 },
      { latitude: 16.004255, longitude: 108.26422 },
      { latitude: 16.004267, longitude: 108.2642 },
      { latitude: 16.004282, longitude: 108.26413 },
    ],
  },

  // ==========================
  // KHU B DOWN BRANCH END
  // ==========================
  {
    id: 'R_B_DOWN_BRANCH_END',
    coordinates: [
      { latitude: 16.004104, longitude: 108.264219 },
      { latitude: 16.004008, longitude: 108.264198 },
      { latitude: 16.004021, longitude: 108.264134 },
    ],
  },

  // ==========================
  // KHU B DOWN FROM JUNCTION
  // ==========================
  {
    id: 'R_B_DOWN_FROM_JUNCTION',
    coordinates: [
      { latitude: 16.004062, longitude: 108.264362 },
      { latitude: 16.003983, longitude: 108.264346 },
      { latitude: 16.003992, longitude: 108.264291 },
    ],
  },

  // ==========================
  // KHU B ELEVATOR ROUTE (MAIN)
  // ==========================
  {
    id: 'R_B_ELEVATOR_MAIN',
    coordinates: [
      { latitude: 16.003237, longitude: 108.264387 },
      { latitude: 16.003369, longitude: 108.264313 },
      { latitude: 16.00353, longitude: 108.264364 },
    ],
  },

  // ==========================
  // KHU B ELEVATOR SMALL BRANCH
  // ==========================
  {
    id: 'R_B_ELEVATOR_SMALL_BRANCH',
    coordinates: [
      { latitude: 16.00353, longitude: 108.264364 },
      { latitude: 16.00354, longitude: 108.264308 },
    ],
  },

  // ==========================
  // KHU B ELEVATOR LONG PATH TO LOOP CONNECTOR
  // ==========================
  {
    id: 'R_B_ELEVATOR_LONG_PATH',
    coordinates: [
      { latitude: 16.00353, longitude: 108.264364 },
      { latitude: 16.003528, longitude: 108.264363 },
      { latitude: 16.003608, longitude: 108.264391 },
      { latitude: 16.0037, longitude: 108.264413 },
      { latitude: 16.003785, longitude: 108.264403 },
      { latitude: 16.003835, longitude: 108.264377 },
      { latitude: 16.003872, longitude: 108.264329 },
      { latitude: 16.003905, longitude: 108.26427 },
      { latitude: 16.00391, longitude: 108.26422 },
      { latitude: 16.003904, longitude: 108.264192 },
      { latitude: 16.003885, longitude: 108.26416 },
      { latitude: 16.003857, longitude: 108.264127 },
    ],
  },

  // ==========================
  // CONNECTOR BRANCH
  // ==========================
  {
    id: 'R_B_ELEVATOR_CONNECTOR_UP',
    coordinates: [
      { latitude: 16.003857, longitude: 108.264127 },
      { latitude: 16.003924, longitude: 108.264079 },
    ],
  },

  // ==========================
  // ELEVATOR DOWN PATH TO LOOP INTERSECT
  // ==========================
  {
    id: 'R_B_ELEVATOR_DOWN_TO_INTERSECT',
    coordinates: [
      { latitude: 16.003857, longitude: 108.264127 },
      { latitude: 16.003837, longitude: 108.264081 },
      { latitude: 16.003787, longitude: 108.264019 },
      { latitude: 16.003736, longitude: 108.263993 },
    ],
  },

  // ==========================
  // LOOP TO A ZONE
  // ==========================
  {
    id: 'R_B_LOOP_TO_A_ZONE',
    coordinates: [
      { latitude: 16.003736, longitude: 108.263993 },
      { latitude: 16.003786, longitude: 108.263889 },
      { latitude: 16.003848, longitude: 108.263801 },
      { latitude: 16.003857, longitude: 108.263762 },
      { latitude: 16.00387, longitude: 108.263658 },
      { latitude: 16.003909, longitude: 108.263564 },
    ],
  },

  // ==========================
  // DOWN FROM INTERSECT
  // ==========================
  {
    id: 'R_B_DOWN_FROM_INTERSECT',
    coordinates: [
      { latitude: 16.003736, longitude: 108.263993 },
      { latitude: 16.003682, longitude: 108.264034 },
      { latitude: 16.003659, longitude: 108.264074 },
      { latitude: 16.003651, longitude: 108.264102 },
      { latitude: 16.003659, longitude: 108.264155 },
      { latitude: 16.003689, longitude: 108.264221 },
    ],
  },
];
