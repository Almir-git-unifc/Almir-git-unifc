export function trophySVG({
  title,
  subtitle,
  points,
  rank,
  progress,
  icon = "🏆",
}) {
  return `
<svg width="200" height="140" viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="200" height="140" rx="12" fill="#0d1117" stroke="#30363d"/>

  <!-- Title -->
  <text x="100" y="22" text-anchor="middle"
        fill="#d4b93c" font-size="14" font-weight="700">
    ${title}
  </text>

  <!-- Trophy icon -->
  <text x="100" y="72" text-anchor="middle" font-size="22">
    ${icon}
  </text>

    <!-- Rank badge -->
  <rect x="79" y="30" width="42" height="22" rx="6" fill="#8957e5"/>
  <text x="100" y="46" text-anchor="middle"
        fill="#fff" font-size="12" font-weight="700">
    ${rank}
  </text>

  <!-- Subtitle -->
  <text x="100" y="92" text-anchor="middle"
        fill="#8b949e" font-size="12">
    ${subtitle}
  </text>

  <!-- Score -->
  <text x="100" y="110" text-anchor="middle"
        fill="#539df1" font-size="13" font-weight="700">
    ${points} pts
  </text>

  <!-- Progress bar -->
  <rect x="12" y="122" width="176" height="8" rx="4" fill="#21262d"/>
  <rect x="12" y="122" width="${(176 * progress) / 100}"
        height="8" rx="4" fill="#b392f0"/>
</svg>
`;
}
