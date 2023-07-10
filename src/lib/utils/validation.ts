const countDecimals = (number: number): number => {
  const split = String(number).split(".")
  return split.length !== 1 ? split[1]?.length : 0;
}

export const validateTemperature = (value: string | undefined): string | undefined => {
  const temperature = value ? parseFloat(value) : 0;

  if (!temperature) {
    return 'Temperature is required';
  }

  if (temperature < 30 || temperature > 40) {
    return 'Temperature must be between 30 and 40';
  }

  if (value && value?.length < 5) {
    return 'Temperature must have at least 2 decimals';
  }

  if (value && value?.length > 5) {
    return 'Temperature must have at most 2 decimals';
  }
};