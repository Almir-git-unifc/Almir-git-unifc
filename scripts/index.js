import fs from "fs";
import { Octokit } from "@octokit/rest";

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN not defined");
  process.exit(1);
}

if (!fs.existsSync("github-stats")) {
  fs.mkdirSync("github-stats", { recursive: true });
}

const octokit = new Octokit({ auth: TOKEN });

/* =========================
LANGUAGE COLORS
========================= */

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  Dart: "#00B4AB",
  Kotlin: "#a97bff",
  Vue: "#41b883",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Other: "#ededed"
};

/* =========================
RANK WEIGHTS
========================= */

const WEIGHTS = {
  stars: 4,
  commits: 3,
  prs: 2,
  contributed: 1
};

/* =========================
SCORE + RANK
========================= */

function calculateScore(stats){

  const stars = stats.stars || 0;
  const commits = stats.commits || 0;
  const prs = stats.prs || 0;
  const contributed = stats.contributed || 0;

  const score =
    WEIGHTS.stars * Math.log10(stars + 1) +
    WEIGHTS.commits * Math.log10(commits + 1) +
    WEIGHTS.prs * Math.log10(prs + 1) +
    WEIGHTS.contributed * Math.log10(contributed + 1);

  return Number(score.toFixed(2));
}

function calculateRank(score){

  if(score >= 22) return "S";
  if(score >= 18) return "A";
  if(score >= 14) return "B";
  if(score >= 10) return "C";
  if(score >= 6) return "D";

  return "E";
}

/* =========================
ICON STYLE
========================= */

const ICON_COLOR = "#037eeb";

const ICONS = {

star: `
<svg x="20" y="58" width="16" height="16"
fill="none"
stroke="${ICON_COLOR}"
stroke-width="2">
<polygon points="8,1 10.5,6 16,6 11.5,9.5 13.5,15 8,11.5 2.5,15 4.5,9.5 0,6 5.5,6"/>
</svg>
`,

commit: `
<svg x="20" y="83" width="16" height="16"
fill="none"
stroke="${ICON_COLOR}"
stroke-width="2">
<circle cx="8" cy="8" r="3"/>
</svg>
`,

pr: `
<svg x="20" y="108" width="16" height="16"
fill="none"
stroke="${ICON_COLOR}"
stroke-width="2">
<path d="M5 3v8M11 5v6"/>
<circle cx="5" cy="2" r="2"/>
<circle cx="11" cy="4" r="2"/>
<circle cx="11" cy="12" r="2"/>
</svg>
`,

issue: `
<svg x="20" y="133" width="16" height="16"
fill="none"
stroke="${ICON_COLOR}"
stroke-width="2">
<circle cx="8" cy="8" r="6"/>
<line x1="8" y1="4" x2="8" y2="9"/>
</svg>
`,

contrib: `
<svg x="20" y="158" width="16" height="16"
fill="none"
stroke="${ICON_COLOR}"
stroke-width="2">
<circle cx="4" cy="8" r="2"/>
<circle cx="12" cy="8" r="2"/>
<line x1="6" y1="8" x2="10" y2="8"/>
</svg>
`

};

/* =========================
DONUT CHART
========================= */

function donut(score,rank){

const percent = Math.min(score/25*100,100);

const r=40;
const c=2*Math.PI*r;
const p=c*(percent/100);

return `
<g transform="translate(320,110)">

<circle r="${r}" cx="0" cy="0"
fill="none"
stroke="#2a2a2a"
stroke-width="10"/>

<circle r="${r}" cx="0" cy="0"
fill="none"
stroke="#66d1a1"
stroke-width="10"
stroke-dasharray="${p} ${c}"
transform="rotate(-90)"/>

<text x="0" y="6"
text-anchor="middle"
fill="#66d1a1"
font-size="18"
font-family="Arial"
font-weight="bold">
${rank}
</text>

</g>
`;
}

/* =========================
STATS CARD
========================= */

function statsSVG(data){

const score = calculateScore(data);

const rank = calculateRank(score);

return `
<svg width="420" height="200"
xmlns="http://www.w3.org/2000/svg">

<rect
width="420"
height="200"
rx="12"
fill="none"
stroke="white"
/>

<text
x="20"
y="30"
font-size="18"
fill="#f7f7f8"
font-family="Arial"
font-weight="bold"
>
${USER} GitHub Stats
</text>

${ICONS.star}
${ICONS.commit}
${ICONS.pr}
${ICONS.issue}
${ICONS.contrib}

<g font-family="Arial" font-size="14">

<text x="50" y="70" fill="#66d1a1">
Total Stars Earned: ${data.stars}
</text>

<text x="50" y="95" fill="#66d1a1">
Commits (last year): ${data.commits}
</text>

<text x="50" y="120" fill="#66d1a1">
Total PRs: ${data.prs}
</text>

<text x="50" y="145" fill="#66d1a1">
Total Issues: ${data.issues}
</text>

<text x="50" y="170" fill="#66d1a1">
Contributed to: ${data.contributed}
</text>

</g>

${donut(score,rank)}

</svg>
`;
}

/* =========================
MAIN
========================= */

async function main(){

try{

const {repos,stars}=await getRepos();

const prs=await getPRs();

const issues=await getIssues();

const {commits,contributed}=
await getCommits();

const languages=
await getLanguages(repos);

const stats={
stars,
prs,
issues,
commits,
contributed
};

fs.writeFileSync(
"github-stats/stats.svg",
statsSVG(stats)
);

fs.writeFileSync(
"github-stats/languages.svg",
languagesSVG(languages)
);

console.log("✅ Stats cards generated");

}catch(err){

console.error("⚠️ Error:",err);
process.exit(1);

}

}

main();
