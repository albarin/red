export const validateTemperature = (temperature: number | undefined): string | undefined => {
  if (temperature === undefined) {
    return;
  }

  if (temperature < 30 || temperature > 40) {
    return 'Temperature must be between 30 and 40';
  }
};