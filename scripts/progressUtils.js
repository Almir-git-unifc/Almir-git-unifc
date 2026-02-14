/**
 * Calcula progress baseado em uma tabela de thresholds
 * A regra deve estar ORDENADA do maior min para o menor.
 */
export function calculateProgress(value, rules) {
  for (const rule of rules) {
    if (value >= rule.min) {
      return rule.progress;
    }
  }

  return 0;
}
