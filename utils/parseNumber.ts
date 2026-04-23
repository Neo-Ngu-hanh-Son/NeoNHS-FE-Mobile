export const parseFloatOrDefault = (value: string | number, defaultValue: number): number => {
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : defaultValue;
};