// mapData.ts
// Generated from user-provided coordinates (Khu A + Khu B + Elevator route)

import type { Point, Edge, MapPoint } from '../types';

/**
 * Helper note:
 * Node IDs are based on coordinates: N_<latitude>_<longitude>
 * Edge IDs are sequential.
 */

export const points: Point[] = [
  // ======================
  // KHU A
  // ======================
  {
    id: 'N_16.002819_108.262470',
    latitude: 16.002819,
    longitude: 108.26247,
    label: 'Cong vao 1 / Cau thang 1',
    kind: 'entrance',
  },

  {
    id: 'N_16.003125_108.262384',
    latitude: 16.003125,
    longitude: 108.262384,
    label: 'Cau thang 1 - 1',
    kind: 'path',
  },
  {
    id: 'N_16.003166_108.262306',
    latitude: 16.003166,
    longitude: 108.262306,
    label: 'Cau thang 1 - 2',
    kind: 'path',
  },
  {
    id: 'N_16.003339_108.262177',
    latitude: 16.003339,
    longitude: 108.262177,
    label: 'Cau thang 1 - 3',
    kind: 'path',
  },
  {
    id: 'N_16.003439_108.262188',
    latitude: 16.003439,
    longitude: 108.262188,
    label: 'Cau thang 1 - 4',
    kind: 'path',
  },
  {
    id: 'N_16.003445_108.262226',
    latitude: 16.003445,
    longitude: 108.262226,
    label: 'Cau thang 1 - 5',
    kind: 'path',
  },
  {
    id: 'N_16.003555_108.262293',
    latitude: 16.003555,
    longitude: 108.262293,
    label: 'Cau thang 1 - 6',
    kind: 'path',
  },
  {
    id: 'N_16.003633_108.262277',
    latitude: 16.003633,
    longitude: 108.262277,
    label: 'Cau thang 1 - 7',
    kind: 'path',
  },
  {
    id: 'N_16.003679_108.262336',
    latitude: 16.003679,
    longitude: 108.262336,
    label: 'Cau thang 1 - 8',
    kind: 'path',
  },

  // Shared node: Cau thang 1 - 9 / Duong vao cong / Nga 3
  {
    id: 'N_16.003651_108.262467',
    latitude: 16.003651,
    longitude: 108.262467,
    label: 'Duong vao cong / Nga 3',
    kind: 'junction_3way',
  },

  // LEFT branch from 16.003651
  { id: 'N_16.003721_108.262491', latitude: 16.003721, longitude: 108.262491, kind: 'path' },
  { id: 'N_16.003744_108.262424', latitude: 16.003744, longitude: 108.262424, kind: 'path' },
  { id: 'N_16.003736_108.262376', latitude: 16.003736, longitude: 108.262376, kind: 'path' },

  {
    id: 'N_16.003754_108.262295',
    latitude: 16.003754,
    longitude: 108.262295,
    label: 'Nga 3',
    kind: 'junction_3way',
  },

  // Right - Duong di
  {
    id: 'N_16.003891_108.262156',
    latitude: 16.003891,
    longitude: 108.262156,
    label: 'Chua Tam Ton',
    kind: 'path',
  },
  { id: 'N_16.003893_108.262092', latitude: 16.003893, longitude: 108.262092, kind: 'path' },
  { id: 'N_16.004017_108.262081', latitude: 16.004017, longitude: 108.262081, kind: 'path' },
  {
    id: 'N_16.004014_108.261987',
    latitude: 16.004014,
    longitude: 108.261987,
    label: 'Cau thang - re trai',
    kind: 'path',
  },
  { id: 'N_16.003911_108.261990', latitude: 16.003911, longitude: 108.26199, kind: 'path' },
  { id: 'N_16.003886_108.261966', latitude: 16.003886, longitude: 108.261966, kind: 'path' },
  { id: 'N_16.003886_108.261901', latitude: 16.003886, longitude: 108.261901, kind: 'path' },
  {
    id: 'N_16.004020_108.261850',
    latitude: 16.00402,
    longitude: 108.26185,
    label: 'Het cau thang',
    kind: 'path',
  },
  { id: 'N_16.003996_108.261622', latitude: 16.003996, longitude: 108.261622, kind: 'path' },
  {
    id: 'N_16.004066_108.261440',
    latitude: 16.004066,
    longitude: 108.26144,
    label: 'Chua Tu Tam',
    kind: 'dead_end',
  },

  // Left - Cau thang toi thap ngam ra song
  { id: 'N_16.003697_108.262242', latitude: 16.003697, longitude: 108.262242, kind: 'path' },
  { id: 'N_16.003654_108.262177', latitude: 16.003654, longitude: 108.262177, kind: 'path' },
  { id: 'N_16.003592_108.262169', latitude: 16.003592, longitude: 108.262169, kind: 'path' },
  {
    id: 'N_16.003556_108.262135',
    latitude: 16.003556,
    longitude: 108.262135,
    label: 'Thap cao checkin',
    kind: 'dead_end',
  },

  // UP branch from main junction
  {
    id: 'N_16.003723_108.262583',
    latitude: 16.003723,
    longitude: 108.262583,
    label: 'Nga 3',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.003821_108.262714',
    latitude: 16.003821,
    longitude: 108.262714,
    label: 'Chua Tam Thai',
    kind: 'path',
  },
  {
    id: 'N_16.003896_108.262650',
    latitude: 16.003896,
    longitude: 108.26265,
    label: 'Duong nho vao more dong',
    kind: 'path',
  },

  {
    id: 'N_16.004071_108.262867',
    latitude: 16.004071,
    longitude: 108.262867,
    label: 'Nga tu - diem ban nuoc',
    kind: 'junction_4way',
  },

  // Nga 2 chain
  {
    id: 'N_16.004081_108.262720',
    latitude: 16.004081,
    longitude: 108.26272,
    label: 'Nga 2',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004091_108.262571',
    latitude: 16.004091,
    longitude: 108.262571,
    label: 'Nga 2',
    kind: 'junction_3way',
  },

  {
    id: 'N_16.004184_108.262342',
    latitude: 16.004184,
    longitude: 108.262342,
    label: 'Huyen Khong cave entrance',
    kind: 'path',
  },
  {
    id: 'N_16.004217_108.262284',
    latitude: 16.004217,
    longitude: 108.262284,
    label: 'Nga 2 inside cave',
    kind: 'junction_3way',
  },

  {
    id: 'N_16.004293_108.262261',
    latitude: 16.004293,
    longitude: 108.262261,
    label: 'Tuong checkin (end)',
    kind: 'dead_end',
  },

  { id: 'N_16.004212_108.262248', latitude: 16.004212, longitude: 108.262248, kind: 'path' },
  {
    id: 'N_16.004299_108.262208',
    latitude: 16.004299,
    longitude: 108.262208,
    label: 'Tuong checkin (end)',
    kind: 'dead_end',
  },

  {
    id: 'N_16.004214_108.262645',
    latitude: 16.004214,
    longitude: 108.262645,
    label: 'Nga 2',
    kind: 'junction_3way',
  },

  // Cau thang from Nga 2
  {
    id: 'N_16.004307_108.262589',
    latitude: 16.004307,
    longitude: 108.262589,
    label: 'Het cau thang',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004334_108.262320',
    latitude: 16.004334,
    longitude: 108.26232,
    label: 'End',
    kind: 'dead_end',
  },

  { id: 'N_16.004460_108.262742', latitude: 16.00446, longitude: 108.262742, kind: 'path' },
  {
    id: 'N_16.004462_108.262821',
    latitude: 16.004462,
    longitude: 108.262821,
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004511_108.262847',
    latitude: 16.004511,
    longitude: 108.262847,
    label: 'Loop point',
    kind: 'junction_3way',
  },

  { id: 'N_16.004280_108.262686', latitude: 16.00428, longitude: 108.262686, kind: 'path' },
  {
    id: 'N_16.004352_108.262774',
    latitude: 16.004352,
    longitude: 108.262774,
    label: 'Noi dung chan',
    kind: 'junction_3way',
  },

  // Nga 3 upper
  {
    id: 'N_16.004167_108.262937',
    latitude: 16.004167,
    longitude: 108.262937,
    label: 'Nga 3',
    kind: 'junction_3way',
  },

  // Right - Cau thang (Linh Nham cave)
  { id: 'N_16.004164_108.263022', latitude: 16.004164, longitude: 108.263022, kind: 'path' },
  {
    id: 'N_16.0042103_108.2630874',
    latitude: 16.0042103,
    longitude: 108.2630874,
    label: 'Linh Nham cave',
    kind: 'dead_end',
  },

  // Left path to stair entrance
  { id: 'N_16.004203_108.262899', latitude: 16.004203, longitude: 108.262899, kind: 'path' },
  { id: 'N_16.004246_108.262880', latitude: 16.004246, longitude: 108.26288, kind: 'path' },
  { id: 'N_16.004298_108.262883', latitude: 16.004298, longitude: 108.262883, kind: 'path' },
  { id: 'N_16.004342_108.262907', latitude: 16.004342, longitude: 108.262907, kind: 'path' },

  {
    id: 'N_16.004396_108.262985',
    latitude: 16.004396,
    longitude: 108.262985,
    label: 'Nga 3 - cau thang entrance',
    kind: 'junction_3way',
  },

  {
    id: 'N_16.004450_108.262990',
    latitude: 16.00445,
    longitude: 108.26299,
    label: 'Nga 2',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004496_108.263068',
    latitude: 16.004496,
    longitude: 108.263068,
    label: 'Entrance cau thang (end)',
    kind: 'dead_end',
  },

  {
    id: 'N_16.004507_108.262842',
    latitude: 16.004507,
    longitude: 108.262842,
    label: 'Loop back to dong 76',
    kind: 'junction_3way',
  },

  // Toilet route
  {
    id: 'N_16.004538_108.262872',
    latitude: 16.004538,
    longitude: 108.262872,
    label: 'Duong toi nha ve sinh',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.0046067_108.2627529',
    latitude: 16.0046067,
    longitude: 108.2627529,
    label: 'Nha ve sinh',
    kind: 'dead_end',
  },

  { id: 'N_16.004594_108.262947', latitude: 16.004594, longitude: 108.262947, kind: 'path' },
  { id: 'N_16.004686_108.263041', latitude: 16.004686, longitude: 108.263041, kind: 'path' },
  { id: 'N_16.004674_108.263046', latitude: 16.004674, longitude: 108.263046, kind: 'path' },
  { id: 'N_16.004659_108.263127', latitude: 16.004659, longitude: 108.263127, kind: 'path' },
  { id: 'N_16.004637_108.263166', latitude: 16.004637, longitude: 108.263166, kind: 'path' },
  { id: 'N_16.004522_108.263175', latitude: 16.004522, longitude: 108.263175, kind: 'path' },

  {
    id: 'N_16.004406_108.263146',
    latitude: 16.004406,
    longitude: 108.263146,
    label: 'Nga 2 (noi voi dong 116)',
    kind: 'junction_3way',
  },

  // Stair path viewpoint
  { id: 'N_16.004375_108.263218', latitude: 16.004375, longitude: 108.263218, kind: 'path' },
  { id: 'N_16.004332_108.263250', latitude: 16.004332, longitude: 108.26325, kind: 'path' },
  { id: 'N_16.004337_108.263333', latitude: 16.004337, longitude: 108.263333, kind: 'path' },
  { id: 'N_16.004417_108.263427', latitude: 16.004417, longitude: 108.263427, kind: 'path' },
  { id: 'N_16.004375_108.263481', latitude: 16.004375, longitude: 108.263481, kind: 'path' },
  { id: 'N_16.004311_108.263497', latitude: 16.004311, longitude: 108.263497, kind: 'path' },
  {
    id: 'N_16.004277_108.263532',
    latitude: 16.004277,
    longitude: 108.263532,
    label: 'View point checkin',
    kind: 'dead_end',
  },

  // Right path from Nga tu (bridge)
  {
    id: 'N_16.004046_108.263024',
    latitude: 16.004046,
    longitude: 108.263024,
    label: 'Nga 2',
    kind: 'junction_3way',
  },
  { id: 'N_16.004032_108.263109', latitude: 16.004032, longitude: 108.263109, kind: 'path' },
  { id: 'N_16.004030_108.263188', latitude: 16.00403, longitude: 108.263188, kind: 'path' },
  { id: 'N_16.004012_108.263264', latitude: 16.004012, longitude: 108.263264, kind: 'path' },
  { id: 'N_16.003988_108.263333', latitude: 16.003988, longitude: 108.263333, kind: 'path' },
  { id: 'N_16.003961_108.263397', latitude: 16.003961, longitude: 108.263397, kind: 'path' },
  { id: 'N_16.003945_108.263473', latitude: 16.003945, longitude: 108.263473, kind: 'path' },
  { id: 'N_16.003933_108.263522', latitude: 16.003933, longitude: 108.263522, kind: 'path' },

  {
    id: 'N_16.003912_108.263566',
    latitude: 16.003912,
    longitude: 108.263566,
    label: 'Nga 3 (Checkpoint het khu A)',
    kind: 'junction_4way',
  },

  // Down from checkpoint (Van Thong cave)
  {
    id: 'N_16.003828_108.263528',
    latitude: 16.003828,
    longitude: 108.263528,
    label: 'Van Thong cave entrance',
    kind: 'path',
  },
  { id: 'N_16.003792_108.263524', latitude: 16.003792, longitude: 108.263524, kind: 'path' },
  { id: 'N_16.003747_108.263542', latitude: 16.003747, longitude: 108.263542, kind: 'path' },
  { id: 'N_16.003702_108.263553', latitude: 16.003702, longitude: 108.263553, kind: 'path' },
  { id: 'N_16.003653_108.263543', latitude: 16.003653, longitude: 108.263543, kind: 'path' },
  { id: 'N_16.003611_108.263530', latitude: 16.003611, longitude: 108.26353, kind: 'path' },
  {
    id: 'N_16.003557_108.263520',
    latitude: 16.003557,
    longitude: 108.26352,
    label: 'Cave exit',
    kind: 'path',
  },
  { id: 'N_16.003506_108.263498', latitude: 16.003506, longitude: 108.263498, kind: 'path' },
  { id: 'N_16.003487_108.263475', latitude: 16.003487, longitude: 108.263475, kind: 'path' },
  { id: 'N_16.003484_108.263438', latitude: 16.003484, longitude: 108.263438, kind: 'path' },
  { id: 'N_16.003517_108.263408', latitude: 16.003517, longitude: 108.263408, kind: 'path' },
  { id: 'N_16.003560_108.263384', latitude: 16.00356, longitude: 108.263384, kind: 'path' },
  { id: 'N_16.003602_108.263366', latitude: 16.003602, longitude: 108.263366, kind: 'path' },
  { id: 'N_16.003652_108.263366', latitude: 16.003652, longitude: 108.263366, kind: 'path' },
  { id: 'N_16.003660_108.263383', latitude: 16.00366, longitude: 108.263383, kind: 'path' },

  {
    id: 'N_16.003658_108.263424',
    latitude: 16.003658,
    longitude: 108.263424,
    label: 'Checkin point (loop)',
    kind: 'junction_3way',
  },

  // Down route from Nga 2 (16.004046...)
  { id: 'N_16.004039_108.263024', latitude: 16.004039, longitude: 108.263024, kind: 'path' },
  { id: 'N_16.004003_108.263029', latitude: 16.004003, longitude: 108.263029, kind: 'path' },
  { id: 'N_16.003959_108.263024', latitude: 16.003959, longitude: 108.263024, kind: 'path' },
  { id: 'N_16.003901_108.263015', latitude: 16.003901, longitude: 108.263015, kind: 'path' },
  { id: 'N_16.003861_108.263009', latitude: 16.003861, longitude: 108.263009, kind: 'path' },
  { id: 'N_16.003826_108.263026', latitude: 16.003826, longitude: 108.263026, kind: 'path' },
  { id: 'N_16.003809_108.263035', latitude: 16.003809, longitude: 108.263035, kind: 'path' },
  { id: 'N_16.003778_108.263126', latitude: 16.003778, longitude: 108.263126, kind: 'path' },
  { id: 'N_16.003776_108.263198', latitude: 16.003776, longitude: 108.263198, kind: 'path' },
  { id: 'N_16.003825_108.263233', latitude: 16.003825, longitude: 108.263233, kind: 'path' },
  { id: 'N_16.003844_108.263307', latitude: 16.003844, longitude: 108.263307, kind: 'path' },
  { id: 'N_16.003842_108.263340', latitude: 16.003842, longitude: 108.26334, kind: 'path' },
  { id: 'N_16.003833_108.263375', latitude: 16.003833, longitude: 108.263375, kind: 'path' },
  { id: 'N_16.003860_108.263395', latitude: 16.00386, longitude: 108.263395, kind: 'path' },
  { id: 'N_16.003888_108.263403', latitude: 16.003888, longitude: 108.263403, kind: 'path' },
  {
    id: 'N_16.003911_108.263417',
    latitude: 16.003911,
    longitude: 108.263417,
    label: 'Nga 3 - re trai',
    kind: 'junction_3way',
  },

  { id: 'N_16.003919_108.263390', latitude: 16.003919, longitude: 108.26339, kind: 'path' },
  {
    id: 'N_16.003936_108.263353',
    latitude: 16.003936,
    longitude: 108.263353,
    label: 'Checkin point end',
    kind: 'dead_end',
  },

  { id: 'N_16.003911_108.263416', latitude: 16.003911, longitude: 108.263416, kind: 'path' },
  { id: 'N_16.003912_108.263442', latitude: 16.003912, longitude: 108.263442, kind: 'path' },
  { id: 'N_16.003872_108.263471', latitude: 16.003872, longitude: 108.263471, kind: 'path' },
  { id: 'N_16.003839_108.263496', latitude: 16.003839, longitude: 108.263496, kind: 'path' },
  { id: 'N_16.003788_108.263502', latitude: 16.003788, longitude: 108.263502, kind: 'path' },
  { id: 'N_16.003758_108.263504', latitude: 16.003758, longitude: 108.263504, kind: 'path' },
  { id: 'N_16.003723_108.263490', latitude: 16.003723, longitude: 108.26349, kind: 'path' },
  { id: 'N_16.003673_108.263463', latitude: 16.003673, longitude: 108.263463, kind: 'path' },
  { id: 'N_16.003654_108.263451', latitude: 16.003654, longitude: 108.263451, kind: 'path' },
  {
    id: 'N_16.003644_108.263432',
    latitude: 16.003644,
    longitude: 108.263432,
    label: 'Nga 3 (noi voi route duoi)',
    kind: 'path',
  },

  // Right branch from main junction (Khu A right)
  { id: 'N_16.003651_108.262652', latitude: 16.003651, longitude: 108.262652, kind: 'path' },
  {
    id: 'N_16.003592_108.262735',
    latitude: 16.003592,
    longitude: 108.262735,
    label: 'Cau thang',
    kind: 'path',
  },
  { id: 'N_16.003584_108.262765', latitude: 16.003584, longitude: 108.262765, kind: 'path' },
  {
    id: 'N_16.003623_108.262875',
    latitude: 16.003623,
    longitude: 108.262875,
    label: 'Point ben phai',
    kind: 'path',
  },
  {
    id: 'N_16.003690_108.262963',
    latitude: 16.00369,
    longitude: 108.262963,
    label: 'Checkin point',
    kind: 'dead_end',
  },

  // ======================
  // KHU B
  // ======================
  {
    id: 'N_16.003273_108.264639',
    latitude: 16.003273,
    longitude: 108.264639,
    label: 'Road',
    kind: 'path',
  },
  {
    id: 'N_16.003527_108.264683',
    latitude: 16.003527,
    longitude: 108.264683,
    label: 'Entrance / Ticket seller / Staircase entrance',
    kind: 'entrance',
  },
  { id: 'N_16.003691_108.264655', latitude: 16.003691, longitude: 108.264655, kind: 'path' },
  { id: 'N_16.003850_108.264581', latitude: 16.00385, longitude: 108.264581, kind: 'path' },
  { id: 'N_16.003892_108.264463', latitude: 16.003892, longitude: 108.264463, kind: 'path' },
  {
    id: 'N_16.004003_108.264472',
    latitude: 16.004003,
    longitude: 108.264472,
    label: 'End staircase / Pagoda entrance',
    kind: 'path',
  },

  {
    id: 'N_16.004116_108.264484',
    latitude: 16.004116,
    longitude: 108.264484,
    label: '3-way intersect',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004119_108.264422',
    latitude: 16.004119,
    longitude: 108.264422,
    label: 'Loop point',
    kind: 'junction_3way',
  },

  {
    id: 'N_16.004109_108.264556',
    latitude: 16.004109,
    longitude: 108.264556,
    label: '3-way intersect (right path)',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004265_108.264569',
    latitude: 16.004265,
    longitude: 108.264569,
    label: 'Staircase entrance',
    kind: 'path',
  },
  {
    id: 'N_16.004313_108.264573',
    latitude: 16.004313,
    longitude: 108.264573,
    label: 'Buddha statue checkin',
    kind: 'path',
  },
  { id: 'N_16.004322_108.264452', latitude: 16.004322, longitude: 108.264452, kind: 'path' },

  {
    id: 'N_16.004058_108.264412',
    latitude: 16.004058,
    longitude: 108.264412,
    label: '3-way intersect',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.004062_108.264362',
    latitude: 16.004062,
    longitude: 108.264362,
    label: '3-way intersect',
    kind: 'junction_3way',
  },

  { id: 'N_16.004080_108.264240', latitude: 16.00408, longitude: 108.26424, kind: 'path' },
  {
    id: 'N_16.004104_108.264219',
    latitude: 16.004104,
    longitude: 108.264219,
    label: '3-way intersect',
    kind: 'junction_3way',
  },

  { id: 'N_16.004182_108.264223', latitude: 16.004182, longitude: 108.264223, kind: 'path' },
  { id: 'N_16.004255_108.264220', latitude: 16.004255, longitude: 108.26422, kind: 'path' },
  { id: 'N_16.004267_108.264200', latitude: 16.004267, longitude: 108.2642, kind: 'path' },
  {
    id: 'N_16.004282_108.264130',
    latitude: 16.004282,
    longitude: 108.26413,
    label: 'Dong Tang Chon cave entrance',
    kind: 'dead_end',
  },

  { id: 'N_16.004008_108.264198', latitude: 16.004008, longitude: 108.264198, kind: 'path' },
  {
    id: 'N_16.004021_108.264134',
    latitude: 16.004021,
    longitude: 108.264134,
    label: 'Checkin spot end',
    kind: 'dead_end',
  },

  { id: 'N_16.003983_108.264346', latitude: 16.003983, longitude: 108.264346, kind: 'path' },
  {
    id: 'N_16.003992_108.264291',
    latitude: 16.003992,
    longitude: 108.264291,
    label: 'Artwork checkin',
    kind: 'dead_end',
  },

  // ======================
  // KHU B - ELEVATOR ROUTE
  // ======================
  { id: 'N_16.003237_108.264387', latitude: 16.003237, longitude: 108.264387, kind: 'path' },
  { id: 'N_16.003369_108.264313', latitude: 16.003369, longitude: 108.264313, kind: 'path' },

  {
    id: 'N_16.003530_108.264364',
    latitude: 16.00353,
    longitude: 108.264364,
    label: '3-way intersect (elevator)',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.003540_108.264308',
    latitude: 16.00354,
    longitude: 108.264308,
    label: 'Thap xa loi',
    kind: 'dead_end',
  },

  { id: 'N_16.003528_108.264363', latitude: 16.003528, longitude: 108.264363, kind: 'path' },
  { id: 'N_16.003608_108.264391', latitude: 16.003608, longitude: 108.264391, kind: 'path' },
  { id: 'N_16.003700_108.264413', latitude: 16.0037, longitude: 108.264413, kind: 'path' },
  { id: 'N_16.003785_108.264403', latitude: 16.003785, longitude: 108.264403, kind: 'path' },
  {
    id: 'N_16.003835_108.264377',
    latitude: 16.003835,
    longitude: 108.264377,
    label: 'Loop with route above',
    kind: 'junction_3way',
  },
  { id: 'N_16.003872_108.264329', latitude: 16.003872, longitude: 108.264329, kind: 'path' },
  { id: 'N_16.003905_108.264270', latitude: 16.003905, longitude: 108.26427, kind: 'path' },
  { id: 'N_16.003910_108.264220', latitude: 16.00391, longitude: 108.26422, kind: 'path' },
  { id: 'N_16.003904_108.264192', latitude: 16.003904, longitude: 108.264192, kind: 'path' },
  { id: 'N_16.003885_108.264160', latitude: 16.003885, longitude: 108.26416, kind: 'path' },

  {
    id: 'N_16.003857_108.264127',
    latitude: 16.003857,
    longitude: 108.264127,
    label: 'Intersect',
    kind: 'junction_3way',
  },
  {
    id: 'N_16.003924_108.264079',
    latitude: 16.003924,
    longitude: 108.264079,
    label: 'Checkin end',
    kind: 'dead_end',
  },

  { id: 'N_16.003837_108.264081', latitude: 16.003837, longitude: 108.264081, kind: 'path' },
  { id: 'N_16.003787_108.264019', latitude: 16.003787, longitude: 108.264019, kind: 'path' },

  {
    id: 'N_16.003736_108.263993',
    latitude: 16.003736,
    longitude: 108.263993,
    label: 'Intersect',
    kind: 'junction_3way',
  },

  // Loop back to A zone (bridge)
  { id: 'N_16.003786_108.263889', latitude: 16.003786, longitude: 108.263889, kind: 'path' },
  {
    id: 'N_16.003848_108.263801',
    latitude: 16.003848,
    longitude: 108.263801,
    label: 'Start bridge',
    kind: 'path',
  },
  {
    id: 'N_16.003857_108.263762',
    latitude: 16.003857,
    longitude: 108.263762,
    label: 'End bridge',
    kind: 'path',
  },
  { id: 'N_16.003870_108.263658', latitude: 16.00387, longitude: 108.263658, kind: 'path' },
  {
    id: 'N_16.003909_108.263564',
    latitude: 16.003909,
    longitude: 108.263564,
    label: 'Loop to A zone checkpoint',
    kind: 'junction_3way',
  },

  // Down from intersect
  { id: 'N_16.003682_108.264034', latitude: 16.003682, longitude: 108.264034, kind: 'path' },
  { id: 'N_16.003659_108.264074', latitude: 16.003659, longitude: 108.264074, kind: 'path' },
  { id: 'N_16.003651_108.264102', latitude: 16.003651, longitude: 108.264102, kind: 'path' },
  { id: 'N_16.003659_108.264155', latitude: 16.003659, longitude: 108.264155, kind: 'path' },
  {
    id: 'N_16.003689_108.264221',
    latitude: 16.003689,
    longitude: 108.264221,
    label: 'Vong hai dai',
    kind: 'dead_end',
  },
];

export const edges: Edge[] = [
  // KHU A main staircase
  {
    id: 'E_001',
    from: 'N_16.002819_108.262470',
    to: 'N_16.003125_108.262384',
    bidirectional: true,
  },
  {
    id: 'E_002',
    from: 'N_16.003125_108.262384',
    to: 'N_16.003166_108.262306',
    bidirectional: true,
  },
  {
    id: 'E_003',
    from: 'N_16.003166_108.262306',
    to: 'N_16.003339_108.262177',
    bidirectional: true,
  },
  {
    id: 'E_004',
    from: 'N_16.003339_108.262177',
    to: 'N_16.003439_108.262188',
    bidirectional: true,
  },
  {
    id: 'E_005',
    from: 'N_16.003439_108.262188',
    to: 'N_16.003445_108.262226',
    bidirectional: true,
  },
  {
    id: 'E_006',
    from: 'N_16.003445_108.262226',
    to: 'N_16.003555_108.262293',
    bidirectional: true,
  },
  {
    id: 'E_007',
    from: 'N_16.003555_108.262293',
    to: 'N_16.003633_108.262277',
    bidirectional: true,
  },
  {
    id: 'E_008',
    from: 'N_16.003633_108.262277',
    to: 'N_16.003679_108.262336',
    bidirectional: true,
  },
  {
    id: 'E_009',
    from: 'N_16.003679_108.262336',
    to: 'N_16.003651_108.262467',
    bidirectional: true,
  },

  // LEFT branch from main junction
  {
    id: 'E_010',
    from: 'N_16.003651_108.262467',
    to: 'N_16.003721_108.262491',
    bidirectional: true,
  },
  {
    id: 'E_011',
    from: 'N_16.003721_108.262491',
    to: 'N_16.003744_108.262424',
    bidirectional: true,
  },
  {
    id: 'E_012',
    from: 'N_16.003744_108.262424',
    to: 'N_16.003736_108.262376',
    bidirectional: true,
  },
  {
    id: 'E_013',
    from: 'N_16.003736_108.262376',
    to: 'N_16.003754_108.262295',
    bidirectional: true,
  },

  // Right - Duong di
  {
    id: 'E_014',
    from: 'N_16.003754_108.262295',
    to: 'N_16.003891_108.262156',
    bidirectional: true,
  },
  {
    id: 'E_015',
    from: 'N_16.003891_108.262156',
    to: 'N_16.003893_108.262092',
    bidirectional: true,
  },
  {
    id: 'E_016',
    from: 'N_16.003893_108.262092',
    to: 'N_16.004017_108.262081',
    bidirectional: true,
  },
  {
    id: 'E_017',
    from: 'N_16.004017_108.262081',
    to: 'N_16.004014_108.261987',
    bidirectional: true,
  },
  {
    id: 'E_018',
    from: 'N_16.004014_108.261987',
    to: 'N_16.003911_108.261990',
    bidirectional: true,
  },
  {
    id: 'E_019',
    from: 'N_16.003911_108.261990',
    to: 'N_16.003886_108.261966',
    bidirectional: true,
  },
  {
    id: 'E_020',
    from: 'N_16.003886_108.261966',
    to: 'N_16.003886_108.261901',
    bidirectional: true,
  },
  {
    id: 'E_021',
    from: 'N_16.003886_108.261901',
    to: 'N_16.004020_108.261850',
    bidirectional: true,
  },
  {
    id: 'E_022',
    from: 'N_16.004020_108.261850',
    to: 'N_16.003996_108.261622',
    bidirectional: true,
  },
  {
    id: 'E_023',
    from: 'N_16.003996_108.261622',
    to: 'N_16.004066_108.261440',
    bidirectional: true,
  },

  // Left - Thap ngam ra song
  {
    id: 'E_024',
    from: 'N_16.003754_108.262295',
    to: 'N_16.003697_108.262242',
    bidirectional: true,
  },
  {
    id: 'E_025',
    from: 'N_16.003697_108.262242',
    to: 'N_16.003654_108.262177',
    bidirectional: true,
  },
  {
    id: 'E_026',
    from: 'N_16.003654_108.262177',
    to: 'N_16.003592_108.262169',
    bidirectional: true,
  },
  {
    id: 'E_027',
    from: 'N_16.003592_108.262169',
    to: 'N_16.003556_108.262135',
    bidirectional: true,
  },

  // UP branch from main junction
  {
    id: 'E_028',
    from: 'N_16.003651_108.262467',
    to: 'N_16.003723_108.262583',
    bidirectional: true,
  },
  {
    id: 'E_029',
    from: 'N_16.003723_108.262583',
    to: 'N_16.003821_108.262714',
    bidirectional: true,
  },
  {
    id: 'E_030',
    from: 'N_16.003821_108.262714',
    to: 'N_16.003896_108.262650',
    bidirectional: true,
  },
  {
    id: 'E_031',
    from: 'N_16.003896_108.262650',
    to: 'N_16.004071_108.262867',
    bidirectional: true,
  },

  // Nga tu -> Nga 2
  {
    id: 'E_032',
    from: 'N_16.004071_108.262867',
    to: 'N_16.004081_108.262720',
    bidirectional: true,
  },
  {
    id: 'E_033',
    from: 'N_16.004081_108.262720',
    to: 'N_16.004091_108.262571',
    bidirectional: true,
  },

  // Cave entrance
  {
    id: 'E_034',
    from: 'N_16.004091_108.262571',
    to: 'N_16.004184_108.262342',
    bidirectional: true,
  },
  {
    id: 'E_035',
    from: 'N_16.004184_108.262342',
    to: 'N_16.004217_108.262284',
    bidirectional: true,
  },

  {
    id: 'E_036',
    from: 'N_16.004217_108.262284',
    to: 'N_16.004293_108.262261',
    bidirectional: true,
  },
  {
    id: 'E_037',
    from: 'N_16.004217_108.262284',
    to: 'N_16.004212_108.262248',
    bidirectional: true,
  },
  {
    id: 'E_038',
    from: 'N_16.004212_108.262248',
    to: 'N_16.004299_108.262208',
    bidirectional: true,
  },

  // Nga 2 upper
  {
    id: 'E_039',
    from: 'N_16.004081_108.262720',
    to: 'N_16.004214_108.262645',
    bidirectional: true,
  },

  {
    id: 'E_040',
    from: 'N_16.004214_108.262645',
    to: 'N_16.004307_108.262589',
    bidirectional: true,
  },
  {
    id: 'E_041',
    from: 'N_16.004307_108.262589',
    to: 'N_16.004334_108.262320',
    bidirectional: true,
  },

  {
    id: 'E_042',
    from: 'N_16.004307_108.262589',
    to: 'N_16.004460_108.262742',
    bidirectional: true,
  },
  {
    id: 'E_043',
    from: 'N_16.004460_108.262742',
    to: 'N_16.004462_108.262821',
    bidirectional: true,
  },
  {
    id: 'E_044',
    from: 'N_16.004462_108.262821',
    to: 'N_16.004511_108.262847',
    bidirectional: true,
  },

  {
    id: 'E_045',
    from: 'N_16.004214_108.262645',
    to: 'N_16.004280_108.262686',
    bidirectional: true,
  },
  {
    id: 'E_046',
    from: 'N_16.004280_108.262686',
    to: 'N_16.004352_108.262774',
    bidirectional: true,
  },
  {
    id: 'E_047',
    from: 'N_16.004352_108.262774',
    to: 'N_16.004462_108.262821',
    bidirectional: true,
  },

  // Nga tu -> upper Nga 3
  {
    id: 'E_048',
    from: 'N_16.004071_108.262867',
    to: 'N_16.004167_108.262937',
    bidirectional: true,
  },

  // Linh Nham cave
  {
    id: 'E_049',
    from: 'N_16.004167_108.262937',
    to: 'N_16.004164_108.263022',
    bidirectional: true,
  },
  {
    id: 'E_050',
    from: 'N_16.004164_108.263022',
    to: 'N_16.0042103_108.2630874',
    bidirectional: true,
  },

  // Stair entrance route
  {
    id: 'E_051',
    from: 'N_16.004167_108.262937',
    to: 'N_16.004203_108.262899',
    bidirectional: true,
  },
  {
    id: 'E_052',
    from: 'N_16.004203_108.262899',
    to: 'N_16.004246_108.262880',
    bidirectional: true,
  },
  {
    id: 'E_053',
    from: 'N_16.004246_108.262880',
    to: 'N_16.004298_108.262883',
    bidirectional: true,
  },
  {
    id: 'E_054',
    from: 'N_16.004298_108.262883',
    to: 'N_16.004342_108.262907',
    bidirectional: true,
  },
  {
    id: 'E_055',
    from: 'N_16.004342_108.262907',
    to: 'N_16.004396_108.262985',
    bidirectional: true,
  },

  {
    id: 'E_056',
    from: 'N_16.004396_108.262985',
    to: 'N_16.004450_108.262990',
    bidirectional: true,
  },
  {
    id: 'E_057',
    from: 'N_16.004450_108.262990',
    to: 'N_16.004496_108.263068',
    bidirectional: true,
  },

  {
    id: 'E_058',
    from: 'N_16.004450_108.262990',
    to: 'N_16.004507_108.262842',
    bidirectional: true,
  },
  {
    id: 'E_059',
    from: 'N_16.004507_108.262842',
    to: 'N_16.004538_108.262872',
    bidirectional: true,
  },
  {
    id: 'E_060',
    from: 'N_16.004538_108.262872',
    to: 'N_16.0046067_108.2627529',
    bidirectional: true,
  },

  {
    id: 'E_061',
    from: 'N_16.004538_108.262872',
    to: 'N_16.004594_108.262947',
    bidirectional: true,
  },
  {
    id: 'E_062',
    from: 'N_16.004594_108.262947',
    to: 'N_16.004686_108.263041',
    bidirectional: true,
  },
  {
    id: 'E_063',
    from: 'N_16.004686_108.263041',
    to: 'N_16.004674_108.263046',
    bidirectional: true,
  },
  {
    id: 'E_064',
    from: 'N_16.004674_108.263046',
    to: 'N_16.004659_108.263127',
    bidirectional: true,
  },
  {
    id: 'E_065',
    from: 'N_16.004659_108.263127',
    to: 'N_16.004637_108.263166',
    bidirectional: true,
  },
  {
    id: 'E_066',
    from: 'N_16.004637_108.263166',
    to: 'N_16.004522_108.263175',
    bidirectional: true,
  },
  {
    id: 'E_067',
    from: 'N_16.004522_108.263175',
    to: 'N_16.004406_108.263146',
    bidirectional: true,
  },

  // Stair viewpoint path
  {
    id: 'E_068',
    from: 'N_16.004406_108.263146',
    to: 'N_16.004375_108.263218',
    bidirectional: true,
  },
  {
    id: 'E_069',
    from: 'N_16.004375_108.263218',
    to: 'N_16.004332_108.263250',
    bidirectional: true,
  },
  {
    id: 'E_070',
    from: 'N_16.004332_108.263250',
    to: 'N_16.004337_108.263333',
    bidirectional: true,
  },
  {
    id: 'E_071',
    from: 'N_16.004337_108.263333',
    to: 'N_16.004417_108.263427',
    bidirectional: true,
  },
  {
    id: 'E_072',
    from: 'N_16.004417_108.263427',
    to: 'N_16.004375_108.263481',
    bidirectional: true,
  },
  {
    id: 'E_073',
    from: 'N_16.004375_108.263481',
    to: 'N_16.004311_108.263497',
    bidirectional: true,
  },
  {
    id: 'E_074',
    from: 'N_16.004311_108.263497',
    to: 'N_16.004277_108.263532',
    bidirectional: true,
  },

  // Nga tu -> right bridge path
  {
    id: 'E_075',
    from: 'N_16.004071_108.262867',
    to: 'N_16.004046_108.263024',
    bidirectional: true,
  },
  {
    id: 'E_076',
    from: 'N_16.004046_108.263024',
    to: 'N_16.004032_108.263109',
    bidirectional: true,
  },
  {
    id: 'E_077',
    from: 'N_16.004032_108.263109',
    to: 'N_16.004030_108.263188',
    bidirectional: true,
  },
  {
    id: 'E_078',
    from: 'N_16.004030_108.263188',
    to: 'N_16.004012_108.263264',
    bidirectional: true,
  },
  {
    id: 'E_079',
    from: 'N_16.004012_108.263264',
    to: 'N_16.003988_108.263333',
    bidirectional: true,
  },
  {
    id: 'E_080',
    from: 'N_16.003988_108.263333',
    to: 'N_16.003961_108.263397',
    bidirectional: true,
  },
  {
    id: 'E_081',
    from: 'N_16.003961_108.263397',
    to: 'N_16.003945_108.263473',
    bidirectional: true,
  },
  {
    id: 'E_082',
    from: 'N_16.003945_108.263473',
    to: 'N_16.003933_108.263522',
    bidirectional: true,
  },
  {
    id: 'E_083',
    from: 'N_16.003933_108.263522',
    to: 'N_16.003912_108.263566',
    bidirectional: true,
  },

  // Van Thong cave down path
  {
    id: 'E_084',
    from: 'N_16.003912_108.263566',
    to: 'N_16.003828_108.263528',
    bidirectional: true,
  },
  {
    id: 'E_085',
    from: 'N_16.003828_108.263528',
    to: 'N_16.003792_108.263524',
    bidirectional: true,
  },
  {
    id: 'E_086',
    from: 'N_16.003792_108.263524',
    to: 'N_16.003747_108.263542',
    bidirectional: true,
  },
  {
    id: 'E_087',
    from: 'N_16.003747_108.263542',
    to: 'N_16.003702_108.263553',
    bidirectional: true,
  },
  {
    id: 'E_088',
    from: 'N_16.003702_108.263553',
    to: 'N_16.003653_108.263543',
    bidirectional: true,
  },
  {
    id: 'E_089',
    from: 'N_16.003653_108.263543',
    to: 'N_16.003611_108.263530',
    bidirectional: true,
  },
  {
    id: 'E_090',
    from: 'N_16.003611_108.263530',
    to: 'N_16.003557_108.263520',
    bidirectional: true,
  },
  {
    id: 'E_091',
    from: 'N_16.003557_108.263520',
    to: 'N_16.003506_108.263498',
    bidirectional: true,
  },
  {
    id: 'E_092',
    from: 'N_16.003506_108.263498',
    to: 'N_16.003487_108.263475',
    bidirectional: true,
  },
  {
    id: 'E_093',
    from: 'N_16.003487_108.263475',
    to: 'N_16.003484_108.263438',
    bidirectional: true,
  },
  {
    id: 'E_094',
    from: 'N_16.003484_108.263438',
    to: 'N_16.003517_108.263408',
    bidirectional: true,
  },
  {
    id: 'E_095',
    from: 'N_16.003517_108.263408',
    to: 'N_16.003560_108.263384',
    bidirectional: true,
  },
  {
    id: 'E_096',
    from: 'N_16.003560_108.263384',
    to: 'N_16.003602_108.263366',
    bidirectional: true,
  },
  {
    id: 'E_097',
    from: 'N_16.003602_108.263366',
    to: 'N_16.003652_108.263366',
    bidirectional: true,
  },
  {
    id: 'E_098',
    from: 'N_16.003652_108.263366',
    to: 'N_16.003660_108.263383',
    bidirectional: true,
  },
  {
    id: 'E_099',
    from: 'N_16.003660_108.263383',
    to: 'N_16.003658_108.263424',
    bidirectional: true,
  },

  // Down route from Nga 2
  {
    id: 'E_100',
    from: 'N_16.004046_108.263024',
    to: 'N_16.004039_108.263024',
    bidirectional: true,
  },
  {
    id: 'E_101',
    from: 'N_16.004039_108.263024',
    to: 'N_16.004003_108.263029',
    bidirectional: true,
  },
  {
    id: 'E_102',
    from: 'N_16.004003_108.263029',
    to: 'N_16.003959_108.263024',
    bidirectional: true,
  },
  {
    id: 'E_103',
    from: 'N_16.003959_108.263024',
    to: 'N_16.003901_108.263015',
    bidirectional: true,
  },
  {
    id: 'E_104',
    from: 'N_16.003901_108.263015',
    to: 'N_16.003861_108.263009',
    bidirectional: true,
  },
  {
    id: 'E_105',
    from: 'N_16.003861_108.263009',
    to: 'N_16.003826_108.263026',
    bidirectional: true,
  },
  {
    id: 'E_106',
    from: 'N_16.003826_108.263026',
    to: 'N_16.003809_108.263035',
    bidirectional: true,
  },
  {
    id: 'E_107',
    from: 'N_16.003809_108.263035',
    to: 'N_16.003778_108.263126',
    bidirectional: true,
  },
  {
    id: 'E_108',
    from: 'N_16.003778_108.263126',
    to: 'N_16.003776_108.263198',
    bidirectional: true,
  },
  {
    id: 'E_109',
    from: 'N_16.003776_108.263198',
    to: 'N_16.003825_108.263233',
    bidirectional: true,
  },
  {
    id: 'E_110',
    from: 'N_16.003825_108.263233',
    to: 'N_16.003844_108.263307',
    bidirectional: true,
  },
  {
    id: 'E_111',
    from: 'N_16.003844_108.263307',
    to: 'N_16.003842_108.263340',
    bidirectional: true,
  },
  {
    id: 'E_112',
    from: 'N_16.003842_108.263340',
    to: 'N_16.003833_108.263375',
    bidirectional: true,
  },
  {
    id: 'E_113',
    from: 'N_16.003833_108.263375',
    to: 'N_16.003860_108.263395',
    bidirectional: true,
  },
  {
    id: 'E_114',
    from: 'N_16.003860_108.263395',
    to: 'N_16.003888_108.263403',
    bidirectional: true,
  },
  {
    id: 'E_115',
    from: 'N_16.003888_108.263403',
    to: 'N_16.003911_108.263417',
    bidirectional: true,
  },

  {
    id: 'E_116',
    from: 'N_16.003911_108.263417',
    to: 'N_16.003919_108.263390',
    bidirectional: true,
  },
  {
    id: 'E_117',
    from: 'N_16.003919_108.263390',
    to: 'N_16.003936_108.263353',
    bidirectional: true,
  },

  {
    id: 'E_118',
    from: 'N_16.003911_108.263417',
    to: 'N_16.003911_108.263416',
    bidirectional: true,
  },
  {
    id: 'E_119',
    from: 'N_16.003911_108.263416',
    to: 'N_16.003912_108.263442',
    bidirectional: true,
  },
  {
    id: 'E_120',
    from: 'N_16.003912_108.263442',
    to: 'N_16.003872_108.263471',
    bidirectional: true,
  },
  {
    id: 'E_121',
    from: 'N_16.003872_108.263471',
    to: 'N_16.003839_108.263496',
    bidirectional: true,
  },
  {
    id: 'E_122',
    from: 'N_16.003839_108.263496',
    to: 'N_16.003788_108.263502',
    bidirectional: true,
  },
  {
    id: 'E_123',
    from: 'N_16.003788_108.263502',
    to: 'N_16.003758_108.263504',
    bidirectional: true,
  },
  {
    id: 'E_124',
    from: 'N_16.003758_108.263504',
    to: 'N_16.003723_108.263490',
    bidirectional: true,
  },
  {
    id: 'E_125',
    from: 'N_16.003723_108.263490',
    to: 'N_16.003673_108.263463',
    bidirectional: true,
  },
  {
    id: 'E_126',
    from: 'N_16.003673_108.263463',
    to: 'N_16.003654_108.263451',
    bidirectional: true,
  },
  {
    id: 'E_127',
    from: 'N_16.003654_108.263451',
    to: 'N_16.003644_108.263432',
    bidirectional: true,
  },
  {
    id: 'E_128',
    from: 'N_16.003644_108.263432',
    to: 'N_16.003658_108.263424',
    bidirectional: true,
  },

  // Right branch from main junction (Khu A right)
  {
    id: 'E_129',
    from: 'N_16.003651_108.262467',
    to: 'N_16.003651_108.262652',
    bidirectional: true,
  },
  {
    id: 'E_130',
    from: 'N_16.003651_108.262652',
    to: 'N_16.003592_108.262735',
    bidirectional: true,
  },
  {
    id: 'E_131',
    from: 'N_16.003592_108.262735',
    to: 'N_16.003584_108.262765',
    bidirectional: true,
  },
  {
    id: 'E_132',
    from: 'N_16.003584_108.262765',
    to: 'N_16.003623_108.262875',
    bidirectional: true,
  },
  {
    id: 'E_133',
    from: 'N_16.003623_108.262875',
    to: 'N_16.003690_108.262963',
    bidirectional: true,
  },

  // ======================
  // KHU B MAIN PATH
  // ======================
  {
    id: 'E_134',
    from: 'N_16.003273_108.264639',
    to: 'N_16.003527_108.264683',
    bidirectional: true,
  },
  {
    id: 'E_135',
    from: 'N_16.003527_108.264683',
    to: 'N_16.003691_108.264655',
    bidirectional: true,
  },
  {
    id: 'E_136',
    from: 'N_16.003691_108.264655',
    to: 'N_16.003850_108.264581',
    bidirectional: true,
  },
  {
    id: 'E_137',
    from: 'N_16.003850_108.264581',
    to: 'N_16.003892_108.264463',
    bidirectional: true,
  },
  {
    id: 'E_138',
    from: 'N_16.003892_108.264463',
    to: 'N_16.004003_108.264472',
    bidirectional: true,
  },
  {
    id: 'E_139',
    from: 'N_16.004003_108.264472',
    to: 'N_16.004116_108.264484',
    bidirectional: true,
  },

  // Khu B split left loop
  {
    id: 'E_140',
    from: 'N_16.004116_108.264484',
    to: 'N_16.004119_108.264422',
    bidirectional: true,
  },

  // Khu B right path
  {
    id: 'E_141',
    from: 'N_16.004116_108.264484',
    to: 'N_16.004109_108.264556',
    bidirectional: true,
  },
  {
    id: 'E_142',
    from: 'N_16.004109_108.264556',
    to: 'N_16.004265_108.264569',
    bidirectional: true,
  },
  {
    id: 'E_143',
    from: 'N_16.004265_108.264569',
    to: 'N_16.004313_108.264573',
    bidirectional: true,
  },
  {
    id: 'E_144',
    from: 'N_16.004313_108.264573',
    to: 'N_16.004322_108.264452',
    bidirectional: true,
  },
  {
    id: 'E_145',
    from: 'N_16.004322_108.264452',
    to: 'N_16.004119_108.264422',
    bidirectional: true,
  },

  // Continue to next junction
  {
    id: 'E_146',
    from: 'N_16.004119_108.264422',
    to: 'N_16.004058_108.264412',
    bidirectional: true,
  },
  {
    id: 'E_147',
    from: 'N_16.004058_108.264412',
    to: 'N_16.004062_108.264362',
    bidirectional: true,
  },

  // left branch to cave
  {
    id: 'E_148',
    from: 'N_16.004062_108.264362',
    to: 'N_16.004080_108.264240',
    bidirectional: true,
  },
  {
    id: 'E_149',
    from: 'N_16.004080_108.264240',
    to: 'N_16.004104_108.264219',
    bidirectional: true,
  },

  // up cave path
  {
    id: 'E_150',
    from: 'N_16.004104_108.264219',
    to: 'N_16.004182_108.264223',
    bidirectional: true,
  },
  {
    id: 'E_151',
    from: 'N_16.004182_108.264223',
    to: 'N_16.004255_108.264220',
    bidirectional: true,
  },
  {
    id: 'E_152',
    from: 'N_16.004255_108.264220',
    to: 'N_16.004267_108.264200',
    bidirectional: true,
  },
  {
    id: 'E_153',
    from: 'N_16.004267_108.264200',
    to: 'N_16.004282_108.264130',
    bidirectional: true,
  },

  // down branch end
  {
    id: 'E_154',
    from: 'N_16.004104_108.264219',
    to: 'N_16.004008_108.264198',
    bidirectional: true,
  },
  {
    id: 'E_155',
    from: 'N_16.004008_108.264198',
    to: 'N_16.004021_108.264134',
    bidirectional: true,
  },

  // down from N_16.004062_108.264362
  {
    id: 'E_156',
    from: 'N_16.004062_108.264362',
    to: 'N_16.003983_108.264346',
    bidirectional: true,
  },
  {
    id: 'E_157',
    from: 'N_16.003983_108.264346',
    to: 'N_16.003992_108.264291',
    bidirectional: true,
  },

  // ======================
  // KHU B ELEVATOR ROUTE
  // ======================
  {
    id: 'E_158',
    from: 'N_16.003237_108.264387',
    to: 'N_16.003369_108.264313',
    bidirectional: true,
  },
  {
    id: 'E_159',
    from: 'N_16.003369_108.264313',
    to: 'N_16.003530_108.264364',
    bidirectional: true,
  },

  {
    id: 'E_160',
    from: 'N_16.003530_108.264364',
    to: 'N_16.003540_108.264308',
    bidirectional: true,
  },

  {
    id: 'E_161',
    from: 'N_16.003530_108.264364',
    to: 'N_16.003528_108.264363',
    bidirectional: true,
  },
  {
    id: 'E_162',
    from: 'N_16.003528_108.264363',
    to: 'N_16.003608_108.264391',
    bidirectional: true,
  },
  {
    id: 'E_163',
    from: 'N_16.003608_108.264391',
    to: 'N_16.003700_108.264413',
    bidirectional: true,
  },
  {
    id: 'E_164',
    from: 'N_16.003700_108.264413',
    to: 'N_16.003785_108.264403',
    bidirectional: true,
  },
  {
    id: 'E_165',
    from: 'N_16.003785_108.264403',
    to: 'N_16.003835_108.264377',
    bidirectional: true,
  },
  {
    id: 'E_166',
    from: 'N_16.003835_108.264377',
    to: 'N_16.003872_108.264329',
    bidirectional: true,
  },
  {
    id: 'E_167',
    from: 'N_16.003872_108.264329',
    to: 'N_16.003905_108.264270',
    bidirectional: true,
  },
  {
    id: 'E_168',
    from: 'N_16.003905_108.264270',
    to: 'N_16.003910_108.264220',
    bidirectional: true,
  },
  {
    id: 'E_169',
    from: 'N_16.003910_108.264220',
    to: 'N_16.003904_108.264192',
    bidirectional: true,
  },
  {
    id: 'E_170',
    from: 'N_16.003904_108.264192',
    to: 'N_16.003885_108.264160',
    bidirectional: true,
  },
  {
    id: 'E_171',
    from: 'N_16.003885_108.264160',
    to: 'N_16.003857_108.264127',
    bidirectional: true,
  },

  {
    id: 'E_172',
    from: 'N_16.003857_108.264127',
    to: 'N_16.003924_108.264079',
    bidirectional: true,
  },

  {
    id: 'E_173',
    from: 'N_16.003857_108.264127',
    to: 'N_16.003837_108.264081',
    bidirectional: true,
  },
  {
    id: 'E_174',
    from: 'N_16.003837_108.264081',
    to: 'N_16.003787_108.264019',
    bidirectional: true,
  },
  {
    id: 'E_175',
    from: 'N_16.003787_108.264019',
    to: 'N_16.003736_108.263993',
    bidirectional: true,
  },

  // loop to A zone
  {
    id: 'E_176',
    from: 'N_16.003736_108.263993',
    to: 'N_16.003786_108.263889',
    bidirectional: true,
  },
  {
    id: 'E_177',
    from: 'N_16.003786_108.263889',
    to: 'N_16.003848_108.263801',
    bidirectional: true,
  },
  {
    id: 'E_178',
    from: 'N_16.003848_108.263801',
    to: 'N_16.003857_108.263762',
    bidirectional: true,
  },
  {
    id: 'E_179',
    from: 'N_16.003857_108.263762',
    to: 'N_16.003870_108.263658',
    bidirectional: true,
  },
  {
    id: 'E_180',
    from: 'N_16.003870_108.263658',
    to: 'N_16.003909_108.263564',
    bidirectional: true,
  },

  // down from intersect
  {
    id: 'E_181',
    from: 'N_16.003736_108.263993',
    to: 'N_16.003682_108.264034',
    bidirectional: true,
  },
  {
    id: 'E_182',
    from: 'N_16.003682_108.264034',
    to: 'N_16.003659_108.264074',
    bidirectional: true,
  },
  {
    id: 'E_183',
    from: 'N_16.003659_108.264074',
    to: 'N_16.003651_108.264102',
    bidirectional: true,
  },
  {
    id: 'E_184',
    from: 'N_16.003651_108.264102',
    to: 'N_16.003659_108.264155',
    bidirectional: true,
  },
  {
    id: 'E_185',
    from: 'N_16.003659_108.264155',
    to: 'N_16.003689_108.264221',
    bidirectional: true,
  },
];

export const mapPoints: MapPoint[] = [
  // ======================
  // KHU A POIs
  // ======================
  {
    id: 'POI_chua_tam_ton',
    name: 'Chua Tam Ton',
    description: 'Main pagoda in Khu A with spiritual significance.',
    latitude: 16.003891,
    longitude: 108.262156,
    orderIndex: 1,
    estTimeSpent: 8,
    type: 'pagoda',
  },
  {
    id: 'POI_chua_tu_tam',
    name: 'Chua Tu Tam',
    description: 'Secondary pagoda with tranquil surroundings.',
    latitude: 16.004066,
    longitude: 108.26144,
    orderIndex: 2,
    estTimeSpent: 6,
    type: 'pagoda',
  },
  {
    id: 'POI_thap_cao_checkin',
    name: 'Thap Cao (Check-in)',
    description: 'Scenic check-in spot overlooking the main paths.',
    latitude: 16.003556,
    longitude: 108.262135,
    orderIndex: 3,
    estTimeSpent: 4,
    type: 'checkin',
  },
  {
    id: 'POI_chua_tam_thai',
    name: 'Chua Tam Thai',
    description: 'Historic temple situated along the upper path.',
    latitude: 16.003821,
    longitude: 108.262714,
    orderIndex: 4,
    estTimeSpent: 6,
    type: 'pagoda',
  },
  {
    id: 'POI_ban_nuoc',
    name: 'Diem ban nuoc',
    description: 'Refreshment stand for drinks and quick rest.',
    latitude: 16.004071,
    longitude: 108.262867,
    orderIndex: 5,
    estTimeSpent: 3,
    type: 'shop',
  },
  {
    id: 'POI_huyen_khong_cave',
    name: 'Huyen Khong Cave',
    description: 'Entrance to a cave exploration path.',
    latitude: 16.004184,
    longitude: 108.262342,
    orderIndex: 6,
    estTimeSpent: 10,
    type: 'cave',
  },
  {
    id: 'POI_linh_nham_cave',
    name: 'Linh Nham Cave',
    description: 'Larger cave site for visitors to explore.',
    latitude: 16.0042103,
    longitude: 108.2630874,
    orderIndex: 7,
    estTimeSpent: 12,
    type: 'cave',
  },
  {
    id: 'POI_view_point_A',
    name: 'View Point (Check-in)',
    description: 'Panoramic viewpoint ideal for photos.',
    latitude: 16.004277,
    longitude: 108.263532,
    orderIndex: 8,
    estTimeSpent: 5,
    type: 'viewpoint',
  },
  {
    id: 'POI_nha_ve_sinh',
    name: 'Nha ve sinh',
    description: 'Public restroom facilities.',
    latitude: 16.0046067,
    longitude: 108.2627529,
    orderIndex: 9,
    estTimeSpent: 2,
    type: 'general',
  },
  {
    id: 'POI_van_thong_cave',
    name: 'Van Thong Cave',
    description: 'Secondary cave entrance along the path.',
    latitude: 16.003828,
    longitude: 108.263528,
    orderIndex: 10,
    estTimeSpent: 8,
    type: 'cave',
  },

  // ======================
  // KHU B POIs
  // ======================
  {
    id: 'POI_pagoda_entrance_B',
    name: 'Pagoda entrance',
    description: 'Entrance pagoda marking the start of Khu B.',
    latitude: 16.004003,
    longitude: 108.264472,
    orderIndex: 11,
    estTimeSpent: 5,
    type: 'pagoda',
  },
  {
    id: 'POI_buddha_statue',
    name: 'Buddha statue',
    description: 'Statue landmark popular for photographic check-ins.',
    latitude: 16.004313,
    longitude: 108.264573,
    orderIndex: 12,
    estTimeSpent: 4,
    type: 'statue',
  },
  {
    id: 'POI_dong_tang_chon',
    name: 'Dong Tang Chon',
    description: 'Cave entrance located along the B zone paths.',
    latitude: 16.004282,
    longitude: 108.26413,
    orderIndex: 13,
    estTimeSpent: 10,
    type: 'cave',
  },
  {
    id: 'POI_artwork_checkin',
    name: 'Artwork',
    description: 'Artistic piece worth stopping for photos.',
    latitude: 16.003992,
    longitude: 108.264291,
    orderIndex: 14,
    estTimeSpent: 3,
    type: 'checkin',
  },
  {
    id: 'POI_thap_xa_loi',
    name: 'Thap Xa Loi',
    description: 'Memorial tower landmark.',
    latitude: 16.00354,
    longitude: 108.264308,
    orderIndex: 15,
    estTimeSpent: 6,
    type: 'pagoda',
  },
  {
    id: 'POI_vong_hai_dai',
    name: 'Vong Hai Dai',
    description: 'Scenic rest area along the B zone route.',
    latitude: 16.003689,
    longitude: 108.264221,
    orderIndex: 16,
    estTimeSpent: 5,
    type: 'general',
  },

  // These were marked as check-in only (not part of main paths)
  {
    id: 'POI_fountains',
    name: 'Fountains?',
    description: 'Decorative fountains ideal for quick photo stop.',
    latitude: 16.004079,
    longitude: 108.264651,
    orderIndex: 17,
    estTimeSpent: 2,
    type: 'checkin',
  },
  {
    id: 'POI_viewing_point_B',
    name: 'Viewing point',
    description: 'Additional scenic viewpoint in B zone.',
    latitude: 16.004204,
    longitude: 108.264765,
    orderIndex: 18,
    estTimeSpent: 4,
    type: 'viewpoint',
  },
];

export const mapData = {
  points,
  edges,
  mapPoints,
};
