export const validateTemperature = (temperature: number | undefined): string | undefined => {
  if (temperature === undefined) {
    return;
  }

  if (temperature < 35 || temperature > 40) {
    return 'Temperature must be between 35 and 40';
  }
};