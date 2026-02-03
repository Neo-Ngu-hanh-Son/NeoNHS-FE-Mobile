import { MapPoint } from '../components/Marker/CustomMarker';

// Define all route coordinates
export const ROUTE_COORDINATES = {
    // Main path from entrance to first junction
    mainPath: [
        { latitude: 16.002819, longitude: 108.262470 }, // Cong vao 1, cau thang 1
        { latitude: 16.003125, longitude: 108.262384 }, // Cau thang 1 - 1
        { latitude: 16.003166, longitude: 108.262306 }, // Cau thang 1 - 2
        { latitude: 16.003339, longitude: 108.262177 }, // Cau thang 1 - 3
        { latitude: 16.003439, longitude: 108.262188 }, // Cau thang 1 - 4
        { latitude: 16.003445, longitude: 108.262226 }, // Cau thang 1 - 5
        { latitude: 16.003555, longitude: 108.262293 }, // Cau thang 1 - 6
        { latitude: 16.003633, longitude: 108.262277 }, // Cau thang 1 - 7
        { latitude: 16.003679, longitude: 108.262336 }, // Cau thang 1 - 8
        { latitude: 16.003651, longitude: 108.262467 }, // Cau thang 1 - 9 / Nga 3
    ],

    // Left branch from main junction
    leftBranch: [
        { latitude: 16.003651, longitude: 108.262467 }, // Nga 3 (junction)
        { latitude: 16.003721, longitude: 108.262491 },
        { latitude: 16.003744, longitude: 108.262424 },
        { latitude: 16.003736, longitude: 108.262376 },
        { latitude: 16.003754, longitude: 108.262295 }, // Nga 3 (second junction)
    ],

    // Left branch - Right path (Duong di to Chua tam ton)
    leftBranchRight: [
        { latitude: 16.003754, longitude: 108.262295 }, // Nga 3
        { latitude: 16.003891, longitude: 108.262156 }, // Chua tam ton
        { latitude: 16.003893, longitude: 108.262092 },
        { latitude: 16.004017, longitude: 108.262081 },
    ],

    // Left branch - Left path (Cau thang toi thap ngam ra song)
    leftBranchLeft: [
        { latitude: 16.003754, longitude: 108.262295 }, // Nga 3
        { latitude: 16.003697, longitude: 108.262242 },
        { latitude: 16.003654, longitude: 108.262177 },
        { latitude: 16.003592, longitude: 108.262169 },
        { latitude: 16.003556, longitude: 108.262135 }, // Checkin point - Thap cao
    ],

    // Straight branch from main junction
    straightBranch: [
        { latitude: 16.003651, longitude: 108.262467 }, // Nga 3 (main junction)
        { latitude: 16.003723, longitude: 108.262583 }, // Nga 3 (second junction)
    ],

    // Straight branch - Straight path (to Chua tam thai)
    straightBranchStraight: [
        { latitude: 16.003723, longitude: 108.262583 }, // Nga 3
        { latitude: 16.003821, longitude: 108.262714 }, // Chua tam thai
        { latitude: 16.003896, longitude: 108.262650 }, // Con duong nho
        { latitude: 16.004066, longitude: 108.262870 }, // Nga tu - Diem ban nuoc
    ],

    // Straight branch - Right path (to checkpoint)
    straightBranchRight: [
        { latitude: 16.003723, longitude: 108.262583 }, // Nga 3
        { latitude: 16.003651, longitude: 108.262652 },
        { latitude: 16.003592, longitude: 108.262735 }, // Cau thang
        { latitude: 16.003584, longitude: 108.262765 },
        { latitude: 16.003623, longitude: 108.262875 }, // Diem ben phai
        { latitude: 16.003690, longitude: 108.262963 }, // Check in point
    ],
};

// All routes for rendering polylines
export const ALL_ROUTES = [
    { id: 'main', coordinates: ROUTE_COORDINATES.mainPath, color: '#22c55e' },
    { id: 'left', coordinates: ROUTE_COORDINATES.leftBranch, color: '#22c55e' },
    { id: 'left-right', coordinates: ROUTE_COORDINATES.leftBranchRight, color: '#22c55e' },
    { id: 'left-left', coordinates: ROUTE_COORDINATES.leftBranchLeft, color: '#22c55e' },
    { id: 'straight', coordinates: ROUTE_COORDINATES.straightBranch, color: '#22c55e' },
    { id: 'straight-straight', coordinates: ROUTE_COORDINATES.straightBranchStraight, color: '#22c55e' },
    { id: 'straight-right', coordinates: ROUTE_COORDINATES.straightBranchRight, color: '#22c55e' },
];

// Define key map points (markers)
export const MAP_POINTS: MapPoint[] = [
    // Entrance
    {
        id: 'entrance-1',
        latitude: 16.002819,
        longitude: 108.262470,
        title: 'Cổng vào 1',
        description: 'Lối vào chính - Cầu thang 1',
        type: 'entrance',
    },

    // Main junction
    {
        id: 'junction-main',
        latitude: 16.003651,
        longitude: 108.262467,
        title: 'Ngã 3 chính',
        description: 'Đường vào cổng / Ngã 3',
        type: 'junction',
    },

    // Left branch junction
    {
        id: 'junction-left',
        latitude: 16.003754,
        longitude: 108.262295,
        title: 'Ngã 3',
        description: 'Rẽ phải: Đường đi | Rẽ trái: Tháp cao',
        type: 'junction',
    },

    // Chua tam ton
    {
        id: 'landmark-chuatamton',
        latitude: 16.003891,
        longitude: 108.262156,
        title: 'Chùa Tam Tôn',
        description: 'Điểm tham quan',
        type: 'landmark',
    },

    // Thap cao checkpoint
    {
        id: 'checkpoint-thapcao',
        latitude: 16.003556,
        longitude: 108.262135,
        title: 'Tháp Cao',
        description: 'Checkin point - Tháp ngắm ra sông',
        type: 'checkpoint',
    },

    // Straight branch junction
    {
        id: 'junction-straight',
        latitude: 16.003723,
        longitude: 108.262583,
        title: 'Ngã 3',
        description: 'Thẳng: Chùa Tam Thai | Phải: Check in point',
        type: 'junction',
    },

    // Chua tam thai
    {
        id: 'landmark-chuatamthai',
        latitude: 16.003821,
        longitude: 108.262714,
        title: 'Chùa Tam Thai',
        description: 'Điểm tham quan chính',
        type: 'landmark',
    },

    // Con duong nho
    {
        id: 'waypoint-duongnho',
        latitude: 16.003896,
        longitude: 108.262650,
        title: 'Đường nhỏ',
        description: 'Con đường nhỏ dẫn vào more đông',
        type: 'waypoint',
    },

    // Nga tu - Diem ban nuoc
    {
        id: 'junction-ngatu',
        latitude: 16.004066,
        longitude: 108.262870,
        title: 'Ngã tư',
        description: 'Có điểm bán nước',
        type: 'junction',
    },

    // Cau thang on right branch
    {
        id: 'stairs-right',
        latitude: 16.003592,
        longitude: 108.262735,
        title: 'Cầu thang',
        description: 'Cầu thang trên đường đi',
        type: 'stairs',
    },

    // Diem ben phai
    {
        id: 'waypoint-benphai',
        latitude: 16.003623,
        longitude: 108.262875,
        title: 'Điểm bên phải',
        description: 'Có 1 điểm gì đó ngay bên phải',
        type: 'waypoint',
    },

    // Final checkpoint
    {
        id: 'checkpoint-final',
        latitude: 16.003690,
        longitude: 108.262963,
        title: 'Check in point',
        description: 'Điểm check in cuối',
        type: 'checkpoint',
    },
];

// Map center (calculated from all points)
export const MAP_CENTER = {
    latitude: 16.003500,
    longitude: 108.262500,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
};
