export function resolveRank(value, rules) {
  for (const rule of rules) {
    if (value >= rule.min) {
      return {
        rank: rule.rank,
        subtitle: rule.subtitle,
      };
    }
  }

  return { rank: "C", subtitle: "Newbie" };
}
