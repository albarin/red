export function countDecimals(number: number) {
  return String(number).split(".")[1]?.length;
}