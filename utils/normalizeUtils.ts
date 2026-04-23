export const normalizeString = (str: string) => {
  return str
    .toLowerCase()
    .normalize('NFD') // Decomposes combined characters (ê -> e + ^)
    .replace(/[\u0300-\u036f]/g, '') // Removes the accent marks
    .replace(/đ/g, 'd') // Specifically handle the Vietnamese 'đ'
    .trim();
};