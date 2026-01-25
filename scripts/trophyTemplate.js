export function trophySVG({ title, subtitle, points, rank }) {
  return `
<svg width="420" height="120" viewBox="0 0 420 120"
     xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="120" rx="12"
        fill="#0d1117" stroke="#30363d"/>

  <rect x="16" y="16" width="48" height="48" rx="8"
        fill="#238636"/>
  <text x="40" y="48" text-anchor="middle"
        fill="#ffffff" font-size="20" font-weight="bold">
    ${rank}
  </text>

  <text x="80" y="40" fill="#c9d1d9"
        font-size="18" font-weight="bold">
    ${title}
  </text>

  <text x="80" y="65" fill="#8b949e"
        font-size="14">
    ${subtitle}
  </text>

  <text x="80" y="92" fill="#58a6ff"
        font-size="14">
    ${points}pt
  </text>
</svg>
`;
}
