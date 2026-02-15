export function trophySVG({
  title,
  subtitle,
  points,
  rank,
  progress,
  icon,
}) {
  // SE QUIZER MDUAR A COR DA BADGE DO RANK COLOQUE O CÓDIGO ABAIXO; SENÃO APAGUE ...
  const RANK_COLORS = {
      SSS: "#ff7b72",
      SS:  "#ffa657",
      S:   "#f2cc60",
      AAA: "#d2a8ff",
      AA:  "#a371f7",
      A:   "#58a6ff",
      B:   "#3fb950",
      C:   "#8b949e",
};
  return `
<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="150" rx="12" fill="#0d1117" stroke="#30363d"/>

  <!-- Title -->
  <text x="100" y="22" text-anchor="middle"
        fill="#d4b93c" font-size="14" font-weight="700">
    ${title}
  </text>

  <!-- Trophy icon -->
  <text x="100" y="58" text-anchor="middle" font-size="26">
    ${icon}
  </text>

  <!-- Rank badge -->
  <rect x="75" y="70" width="50" height="22" rx="6"
      fill="${RANK_COLORS[rank] || "#8957e5"}"/>
  <text x="100" y="86" text-anchor="middle"
        fill="#fff" font-size="12" font-weight="700">
    ${rank}
  </text>

  <!-- Subtitle -->
  <text x="100" y="108" text-anchor="middle"
        fill="#788f4d" font-size="12">
    ${subtitle}
  </text>

  <!-- Score -->
  <text x="100" y="125" text-anchor="middle"
        fill="#539df1" font-size="13" font-weight="700">
    `${points} pts`
  </text>

  <!-- Progress bar -->
  <rect x="12" y="135" width="176" height="8" rx="4" fill="#21262d"/>
  <rect x="12" y="135" width="${(1.76 * progress) }"
        height="8" rx="4" fill="#595599"/>
</svg>
`;
}
