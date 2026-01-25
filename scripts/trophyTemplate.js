export function trophySVG({ title, subtitle, points, rank }) {
  return `
<svg width="170" height="110" viewBox="0 0 170 110"
     xmlns="http://www.w3.org/2000/svg">

  <!-- Card -->
  <rect x="0" y="0" width="170" height="110" rx="10"
        fill="#0d1117" stroke="#30363d"/>

  <!-- Rank badge -->
  <rect x="10" y="10" width="34" height="34" rx="6"
        fill="#238636"/>
  <text x="27" y="33" text-anchor="middle"
        fill="#ffffff" font-size="14" font-weight="bold">
    ${rank}
  </text>

  <!-- Title -->
  <text x="52" y="28"
        fill="#c9d1d9"
        font-size="13"
        font-weight="bold">
    ${title}
  </text>

  <!-- Subtitle -->
  <text x="52" y="46"
        fill="#8b949e"
        font-size="10">
    ${subtitle}
  </text>

  <!-- Points -->
  <text x="90" y="85"
        text-anchor="middle"
        fill="#58a6ff"
        font-size="12"
        font-weight="bold">
    ${points}pt
  </text>

</svg>
`;
}
