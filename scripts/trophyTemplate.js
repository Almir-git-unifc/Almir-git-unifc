export function trophySVG({ title, subtitle, points, rank }) {
  return `
<svg width="175" height="115" viewBox="0 0 175 115"
     xmlns="http://www.w3.org/2000/svg">

  <rect width="175" height="115" rx="10"
        fill="#0d1117" stroke="#30363d"/>

  <!-- Rank -->
  <rect x="10" y="10" width="36" height="36" rx="7"
        fill="#238636"/>
  <text x="28" y="35" text-anchor="middle"
        fill="#ffffff" font-size="16" font-weight="700">
    ${rank}
  </text>

  <!-- Title -->
  <text x="54" y="30"
        fill="#c9d1d9"
        font-size="14"
        font-weight="700">
    ${title}
  </text>

  <!-- Subtitle -->
  <text x="54" y="50"
        fill="#8b949e"
        font-size="11">
    ${subtitle}
  </text>

  <!-- Points -->
  <text x="90" y="95"
        text-anchor="middle"
        fill="#58a6ff"
        font-size="14"
        font-weight="700">
    ${points}pt
  </text>

</svg>
`;
}
