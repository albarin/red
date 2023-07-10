const countDecimals = (number: number): number => {
  const split = String(number).split(".")
  return split.length !== 1 ? split[1]?.length : 0;
}

export const validateTemperature = (temperature: number | undefined): string | undefined => {
  if (!temperature) {
    return 'Temperature is required';
  }

  if (temperature < 30 || temperature > 40) {
    return 'Temperature must be between 30 and 40';
  }

  if (countDecimals(temperature) < 2) {
    return 'Temperature must have at least 2 decimals';
  }

  if (countDecimals(temperature) > 2) {
    return 'Temperature must have at most 2 decimals';
  }
};