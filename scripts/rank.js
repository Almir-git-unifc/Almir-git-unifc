export function rankByPoints(points) {
  if (points >= 150) return "AAA";
  if (points >= 100) return "A";
  if (points >= 50)  return "B";
  return "C";
}
