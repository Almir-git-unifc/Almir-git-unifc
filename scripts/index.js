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
ICONS (NEON BLUE SVG)
========================= */

const ICONS = {

star: `
<svg width="14" height="14" viewBox="0 0 24 24">
<path fill="#00eaff"
d="M12 2l3 7 7 .6-5.3 4.6 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.6 9 9z"/>
</svg>`,

commit: `
<svg width="14" height="14" viewBox="0 0 24 24">
<path fill="#00eaff"
d="M12 8a4 4 0 100 8 4 4 0 000-8zm8 3h-3.1a5 5 0 00-9.8 0H4v2h3.1a5 5 0 009.8 0H20z"/>
</svg>`,

pr: `
<svg width="14" height="14" viewBox="0 0 24 24">
<path fill="#00eaff"
d="M7 5a3 3 0 11-2 2.83V16a3 3 0 11-2 0V7.83A3 3 0 017 5zm10 4a3 3 0 11-2 2.83V16a3 3 0 11-2 0V11a5 5 0 10-2-4h2a3 3 0 114 0z"/>
</svg>`,

issue: `
<svg width="14" height="14" viewBox="0 0 24 24">
<path fill="#00eaff"
d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
</svg>`,

repo: `
<svg width="14" height="14" viewBox="0 0 24 24">
<path fill="#00eaff"
d="M4 3h16v18H4zM6 7h12M6 11h12M6 15h8"/>
</svg>`
};

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

const score =
WEIGHTS.stars * Math.log10((stats.stars || 0) + 1) +
WEIGHTS.commits * Math.log10((stats.commits || 0) + 1) +
WEIGHTS.prs * Math.log10((stats.prs || 0) + 1) +
WEIGHTS.contributed * Math.log10((stats.contributed || 0) + 1);

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
GET REPOS
========================= */

async function getRepos(){

let page=1;
let repos=[];
let stars=0;

while(true){

const {data}=await octokit.rest.repos.listForUser({
username:USER,
per_page:100,
page
});

if(!data.length) break;

repos=[...repos,...data];

data.forEach(r=>{
stars+=r.stargazers_count || 0;
});

page++;

}

return {repos,stars};
}

/* =========================
PRS
========================= */

async function getPRs(){

const {data}=await octokit.search.issuesAndPullRequests({
q:`author:${USER} type:pr`
});

return data.total_count || 0;
}

/* =========================
ISSUES
========================= */

async function getIssues(){

const {data}=await octokit.search.issuesAndPullRequests({
q:`author:${USER} type:issue`
});

return data.total_count || 0;
}

/* =========================
COMMITS
========================= */

async function getCommits(){

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const query = `
query($login:String!,$from:DateTime!,$to:DateTime!) {
user(login:$login) {
contributionsCollection(from:$from,to:$to) {
totalCommitContributions
totalRepositoriesWithContributedCommits
}
}
}
`;

const result = await octokit.graphql(query,{
login:USER,
from:oneYearAgo.toISOString(),
to:new Date().toISOString()
});

return{
commits: result.user.contributionsCollection.totalCommitContributions - 19,
contributed: result.user.contributionsCollection.totalRepositoriesWithContributedCommits
};

}

/* =========================
LANGUAGES
========================= */

async function getLanguages(repos){

const map={};

for(const repo of repos){

if(!repo.language) continue;

map[repo.language]=(map[repo.language]||0)+1;

}

return map;
}

/* =========================
LANGUAGE CARD
========================= */

function languagesSVG(langs){

let y=60;
let rows="";

const total=Object.values(langs).reduce((a,b)=>a+b,0);

Object.entries(langs)
.sort((a,b)=>b[1]-a[1])
.slice(0,6)
.forEach(([lang,val])=>{

const percent=((val/total)*100).toFixed(2);
const color=LANGUAGE_COLORS[lang]||LANGUAGE_COLORS.Other;

rows+=`

<text x="20" y="${y}" fill="#66d1a1" font-size="12">${lang}</text>

<rect x="120" y="${y-10}" width="140" height="8" fill="#1f2f3a" rx="4"/>

<rect x="120" y="${y-10}" width="${percent*1.4}" height="8"
fill="${color}" rx="4"/>

<text x="310" y="${y}" fill="#66d1a1" font-size="12" text-anchor="end">
${percent}%
</text>

`;

y+=25;

});

return`

<svg width="360" height="200"
xmlns="http://www.w3.org/2000/svg">

<rect width="360" height="200"
rx="12"
fill="#315e7f"
stroke="#1b3c55"
stroke-width="1.5"/>

<text x="20" y="25"
font-size="18"
fill="#ffffff"
font-family="Arial"
font-weight="bold">
Top Languages
</text>

${rows}

</svg>

`;

}

/* =========================
DONUT
========================= */

function donut(score,rank){

const percent=Math.min(score/25*100,100);

const r=40;
const c=2*Math.PI*r;
const p=c*(percent/100);

return`

<g transform="translate(320,110)">

<circle r="${r}" cx="0" cy="0"
fill="none"
stroke="#1f2f3a"
stroke-width="10"/>

<circle r="${r}" cx="0" cy="0"
fill="none"
stroke="#00eaff"
stroke-width="10"
stroke-dasharray="${p} ${c}"
transform="rotate(-90)"/>

<text x="0" y="6"
text-anchor="middle"
fill="#00eaff"
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

const score=calculateScore(data);
const rank=calculateRank(score);

return`

<svg width="420" height="200"
xmlns="http://www.w3.org/2000/svg">

<rect width="420" height="200"
rx="12"
fill="#315e7f"
stroke="#1b3c55"
stroke-width="1.5"/>

<text x="20" y="30"
font-size="18"
fill="#ffffff"
font-family="Arial"
font-weight="bold">
${USER} GitHub Stats
</text>

<g font-family="Arial" font-size="14" fill="#66d1a1">

<g transform="translate(30,60)">
${ICONS.star}
<text x="20" y="12">Total Stars Earned: ${data.stars}</text>
</g>

<g transform="translate(30,85)">
${ICONS.commit}
<text x="20" y="12">Commits (last year): ${data.commits}</text>
</g>

<g transform="translate(30,110)">
${ICONS.pr}
<text x="20" y="12">Total PRs: ${data.prs}</text>
</g>

<g transform="translate(30,135)">
${ICONS.issue}
<text x="20" y="12">Total Issues: ${data.issues}</text>
</g>

<g transform="translate(30,160)">
${ICONS.repo}
<text x="20" y="12">Contributed to: ${data.contributed}</text>
</g>

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

const {commits,contributed}=await getCommits();

const languages=await getLanguages(repos);

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
