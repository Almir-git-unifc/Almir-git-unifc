export function trophySVG({
  title,
  subtitle,
  points,
  rank,
  progress,
  icon,
  backgroundColor = "#315e7f"
}) {
  const RANK_COLORS = {
    SSS: "#8856e4",
    SS: "#8856e4",
    S: "#8856e4",
    AAA: "#8856e4",
    AA: "#8856e4",
    A: "#8856e4",
    B: "#8856e4",
    C: "#8856e4",
  };

  return `
<svg width="200" height="150" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo do Card -->
  <rect width="200" height="150" rx="12" fill="${backgroundColor}" stroke="#1b3c55" stroke-width="1.5"/>

  <!-- Título -->
  <text x="100" y="22" text-anchor="middle"
        fill="#d4b93c" font-size="14" font-weight="700" font-family="Arial">
    ${title}
  </text>

  <!-- Ícone do Troféu (Posicionado entre o título e a badge) -->
  <g transform="translate(88, 32)">
    ${icon}
  </g>

  <!-- Badge do Rank -->
  <rect x="75" y="68" width="50" height="20" rx="6"
        fill="${RANK_COLORS[rank] || "#315e7f"}"/>
  <text x="100" y="83" text-anchor="middle"
        fill="#fff" font-size="12" font-weight="700" font-family="Arial">
    ${rank}
  </text>

  <!-- Subtítulo -->
  <text x="100" y="105" text-anchor="middle"
        fill="#66d1a1" font-size="11" font-family="Arial">
    ${subtitle}
  </text>

  <!-- Pontuação -->
  <text x="100" y="122" text-anchor="middle"
        fill="#8856e4" font-size="12" font-weight="700" font-family="Arial">
    ${points} pts
  </text>

  <!-- Barra de Progresso -->
  <rect x="12" y="133" width="176" height="7" rx="3.5" fill="#1f2f3a"/>
  <rect x="12" y="133" width="${(1.76 * Math.min(progress, 100))}"
        height="7" rx="3.5" fill="#00eaff"/>
</svg>
`;
}
