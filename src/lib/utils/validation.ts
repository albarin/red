const countDecimals = (number: number): number => {
  const split = String(number).split(".")
  return split.length !== 1 ? split[1]?.length : 0;
}

export const validateTemperature = (temperature: number | undefined): string | undefined => {
  if (!temperature) {
    return;
  }

  if (temperature < 30 || temperature > 40) {
    return 'Temperature must be between 30 and 40';
  }
};