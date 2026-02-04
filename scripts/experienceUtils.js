/**
 * Converte anos de experiência em score visual
 * (valor exibido no card, estilo ryo-ma)
 */
export function experienceScore(years) {
  if (years >= 20) return 70;
  if (years >= 15) return 55;
  if (years >= 10) return 40;
  if (years >= 7.5) return 28;
  if (years >= 5) return 18;
  if (years >= 4) return 18;
  if (years >= 3) return 11;
  if (years >= 1.5) return 6;
  return 2;
}

/**
 * Converte anos de experiência em % da barra de progresso
 */
export function experienceProgress(years) {
  const min = 1.5;
  const max = 70;

  if (years <= min) return 5;
  if (years >= max) return 100;

  return Math.round(((years - min) / (max - min)) * 100);
}
