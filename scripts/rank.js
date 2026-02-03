export function rankByPoints(points) {
  if (points >= 200) return "AAA";
  if (points >= 150) return "AA";
  if (points >= 100) return "A";
  if (points >= 50)  return "B";
  return "C";
}
