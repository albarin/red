const countDecimals = (number: number): number => {
  return String(number).split(".")[1]?.length;
}

export const validateTemperature = (temperature: number | undefined): string | undefined => {
  if (temperature && (temperature < 30 || temperature > 40)) {
    return 'Temperature must be between 30 and 40';
  }

  if (temperature && countDecimals(temperature) > 2) {
    return 'Temperature must have at most 2 decimals';
  }
};