import fs from "fs";
import { Octokit } from "@octokit/rest";

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("Token not found");
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
ICONS (outline neon)
========================= */

const ICON_COLOR = "#037eeb";

const ICONS = {
  star: `<svg width="16" height="16" fill="none" stroke="${ICON_COLOR}" stroke-width="2"><polygon points="8,1 10.5,6 16,6 11.5,9.5 13.5,15 8,11.5 2.5,15 4.5,9.5 0,6 5.5,6"/></svg>`,

  commit: `<svg width="16" height="16" fill="none" stroke="${ICON_COLOR}" stroke-width="2"><circle cx="8" cy="8" r="3"/></svg>`,

  pr: `<svg width="16" height="16" fill="none" stroke="${ICON_COLOR}" stroke-width="2"><path d="M5 3v8M11 5v6"/><circle cx="5" cy="2" r="2"/><circle cx="11" cy="4" r="2"/><circle cx="11" cy="12" r="2"/></svg>`,

  issue: `<svg width="16" height="16" fill="none" stroke="${ICON_COLOR}" stroke-width="2"><circle cx="8" cy="8" r="6"/><line x1="8" y1="4" x2="8" y2="9"/></svg>`,

  contrib: `<svg width="16" height="16" fill="none" stroke="${ICON_COLOR}" stroke-width="2"><circle cx="4" cy="8" r="2"/><circle cx="12" cy="8" r="2"/><line x1="6" y1="8" x2="10" y2="8"/></svg>`
};

/* =========================
API CALLS
========================= */

async function getRepos() {

  const repos = await octokit.paginate(
    octokit.repos.listForUser,
    { username: USER, per_page: 100 }
  );

  const stars = repos.reduce(
    (sum, r) => sum + r.stargazers_count,
    0
  );

  return { repos, stars };
}

async function getPRs() {

  const { data } =
    await octokit.search.issuesAndPullRequests({
      q: `is:pr author:${USER} is:merged`,
      per_page: 1
    });

  return data.total_count;
}

async function getIssues() {

  const { data } =
    await octokit.search.issuesAndPullRequests({
      q: `type:issue author:${USER}`,
      per_page: 1
    });

  return data.total_count;
}

async function getCommits() {

  const year = new Date();
  year.setFullYear(year.getFullYear() - 1);

  const query = `
  query($login:String!,$from:DateTime!,$to:DateTime!){
    user(login:$login){
      contributionsCollection(from:$from,to:$to){
        totalCommitContributions
        totalRepositoriesWithContributedCommits
      }
    }
  }`;

  const res = await octokit.graphql(query, {
    login: USER,
    from: year.toISOString(),
    to: new Date().toISOString()
  });

  return {
    commits:
      res.user.contributionsCollection.totalCommitContributions,

    contributed:
      res.user.contributionsCollection.totalRepositoriesWithContributedCommits
  };
}

/* =========================
LANGUAGES
========================= */

async function getLanguages(repos) {

  const map = {};

  for (const repo of repos) {

    const { data } =
      await octokit.repos.listLanguages({
        owner: USER,
        repo: repo.name
      });

    for (const lang in data) {

      map[lang] =
        (map[lang] || 0) + data[lang];
    }
  }

  return map;
}

/* =========================
DONUT CHART
========================= */

function donut(percent, rank) {

  const r = 40;
  const c = 2 * Math.PI * r;
  const p = c * (percent / 100);

  return `
<g transform="translate(320,120)">

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
font-family="Arial">${rank}</text>

</g>
`;
}

/* =========================
STATS CARD
========================= */

function statsSVG(data) {

const score =
(data.stars +
data.prs*2 +
data.commits/10)/10;

const percent=Math.min(score,100);

const rank=percent>75?"A":"B";

return `
<svg width="420" height="200"
xmlns="http://www.w3.org/2000/svg">

<rect width="420" height="200"
rx="12"
fill="none"
stroke="white"/>

<text x="20" y="30"
font-size="18"
fill="#f7f7f8"
font-family="Arial">
${USER} GitHub Stats
</text>

<g font-size="14"
fill="#66d1a1"
font-family="Arial">

<foreignObject x="20" y="50" width="250" height="120">

<div xmlns="http://www.w3.org/1999/xhtml">

<div>${ICONS.star} Total Stars Earned: ${data.stars}</div>
<div>${ICONS.commit} Commits (last year): ${data.commits}</div>
<div>${ICONS.pr} Total PRs: ${data.prs}</div>
<div>${ICONS.issue} Total Issues: ${data.issues}</div>
<div>${ICONS.contrib} Contributed to: ${data.contributed}</div>

</div>

</foreignObject>

</g>

${donut(percent,rank)}

</svg>
`;
}

/* =========================
LANGUAGE CARD
========================= */

function languagesSVG(languages){

const entries=
Object.entries(languages)
.sort((a,b)=>b[1]-a[1])
.slice(0,5);

const total=
entries.reduce((s,[,v])=>s+v,0);

let y=60;
let bars="";

for(const [lang,val] of entries){

const pct=(val/total)*100;

const width=260*(pct/100);

const color=
LANGUAGE_COLORS[lang]||
LANGUAGE_COLORS.Other;

bars+=`

<text x="20" y="${y}"
fill="#66d1a1"
font-size="13">${lang}</text>

<rect x="20" y="${y+6}"
width="260" height="8"
fill="#ffffff22"
rx="4"/>

<rect x="20" y="${y+6}"
width="${width}" height="8"
fill="${color}"
rx="4"/>

<text x="290" y="${y+13}"
fill="#66d1a1"
font-size="12">
${pct.toFixed(2)}%
</text>
`;

y+=28;
}

return `
<svg width="420" height="200"
xmlns="http://www.w3.org/2000/svg">

<rect width="420" height="200"
rx="12"
fill="none"
stroke="white"/>

<text x="20" y="30"
font-size="18"
fill="#f7f7f8">
Linguagens mais usadas
</text>

${bars}

</svg>
`;
}

/* =========================
MAIN
========================= */

async function main(){

const {repos,stars}=await getRepos();

const prs=await getPRs();

const issues=await getIssues();

const {commits,contributed}=await getCommits();

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

console.log("Stats generated");

}

main();

