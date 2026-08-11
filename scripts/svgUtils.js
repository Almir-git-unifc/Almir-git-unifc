export function donut(percent, rank = "A") {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Limita o percentual entre 0 e 100
  const validPercent = Math.min(Math.max(percent, 0), 100);
  const progress = circumference * (validPercent / 100);

  return `
  <g transform="translate(360, 115)">
    <!-- Círculo de Fundo (Trilho) -->
    <circle
      r="${radius}"
      cx="0"
      cy="0"
      fill="none"
      stroke="#1f2f3a"
      stroke-width="10"
    />

    <!-- Círculo de Progresso -->
    <circle
      r="${radius}"
      cx="0"
      cy="0"
      fill="none"
      stroke="#00eaff"
      stroke-width="10"
      stroke-dasharray="${progress} ${circumference}"
      stroke-linecap="round"
      transform="rotate(-90)"
    />

    <!-- Texto do Rank no Centro -->
    <text
      x="0"
      y="7"
      text-anchor="middle"
      fill="#ffffff"
      font-size="22"
      font-weight="bold"
      font-family="Arial"
    >
      ${rank}
    </text>
  </g>
  `;
}
