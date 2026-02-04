export function experienceProgress(years) {
  const min = 1.5;
  const max = 70;

  if (years <= min) return 5;
  if (years >= max) return 100;

  return Math.round(((years - min) / (max - min)) * 100);
}
