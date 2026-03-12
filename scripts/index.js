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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24px" height = "24px">
<!--!Font Awesome Free v5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.-->
<path fill="#00eaff" d="M504 255.531c.253 136.64-111.18 248.372-247.82 248.468-59.015.042-113.223-20.53-155.822-54.911-11.077-8.94-11.905-25.541-1.839-35.607l11.267-11.267c8.609-8.609 22.353-9.551 31.891-1.984C173.062 425.135 212.781 440 256 440c101.705 0 184-82.311 184-184 0-101.705-82.311-184-184-184-48.814 0-93.149 18.969-126.068 49.932l50.754 50.754c10.08 10.08 2.941 27.314-11.313 27.314H24c-8.837 0-16-7.163-16-16V38.627c0-14.254 17.234-21.393 27.314-11.314l49.372 49.372C129.209 34.136 189.552 8 256 8c136.81 0 247.747 110.78 248 247.531zm-180.912 78.784l9.823-12.63c8.138-10.463 6.253-25.542-4.21-33.679L288 256.349V152c0-13.255-10.745-24-24-24h-16c-13.255 0-24 10.745-24 24v135.651l65.409 50.874c10.463 8.137 25.541 6.253 33.679-4.21z"/>
</svg>

pr: `
<svg width="28px" height="28px" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <path fill="#00eaff" d="M 3.8000778,1.800156 C 2.9170015,1.800156 2.200234,2.516924 2.200234,3.4 c 0,0.590279 0.3237166,1.100917 0.8001562,1.378723 l 0,5.243178 C 2.524419,10.299239 2.200234,10.809409 2.200234,11.400156 2.200234,12.282764 2.9170015,13 3.8000778,13 c 0.8830764,0 1.5998439,-0.717236 1.5998439,-1.599844 0,-0.590747 -0.3232481,-1.100917 -0.8001562,-1.378255 l 0,-5.243178 C 5.0766736,4.500917 5.3999217,3.990279 5.3999217,3.4 c 0,-0.883076 -0.7167675,-1.599844 -1.5998439,-1.599844 z m 0,10.399688 c -0.4413039,0 -0.8001561,-0.357915 -0.8001561,-0.800156 0,-0.441304 0.3583837,-0.800156 0.8001561,-0.800156 0.4427094,0 0.8001562,0.358383 0.8001562,0.800156 0,0.442241 -0.3574468,0.800156 -0.8001562,0.800156 z m 0,-7.999688 C 3.3587739,4.200156 2.9999217,3.842709 2.9999217,3.4 c 0,-0.442709 0.3583837,-0.800156 0.8001561,-0.800156 0.4427094,0 0.8001562,0.357447 0.8001562,0.800156 0,0.442709 -0.3574468,0.800156 -0.8001562,0.800156 z m 7.2000002,5.821745 0,-5.022057 c 0,-2.40609 -2.4,-2.4 -2.4,-2.4 l -0.800156,0 0,-1.599844 -2.4000003,2.4 2.4000003,2.4 0,-1.599844 c 0,0 0.333554,0 0.800156,0 0.705524,0 0.800156,0.800156 0.800156,0.800156 l 0,5.021589 c -0.47644,0.277338 -0.800156,0.786571 -0.800156,1.378255 0,0.882608 0.717236,1.599844 1.599844,1.599844 0.882608,0 1.599844,-0.717236 1.599844,-1.599844 0,-0.590747 -0.323717,-1.100917 -0.800157,-1.378255 z m -0.799688,2.177943 c -0.441304,0 -0.800156,-0.357915 -0.800156,-0.800156 0,-0.441304 0.358384,-0.800156 0.800156,-0.800156 0.442241,0 0.800156,0.358383 0.800156,0.800156 0,0.442241 -0.357915,0.800156 -0.800156,0.800156 z"/>
</svg>`,

issue: `
<svg width="24" height="24" viewBox="0 0 28 28">
<g>
	<g id="c129_exclamation">
		<path  fill="#00eaff"d="M13.983,0C6.261,0,0.001,6.259,0.001,13.979c0,7.724,6.26,13.984,13.982,13.984s13.98-6.261,13.98-13.984
			C27.963,6.259,21.705,0,13.983,0z M13.983,26.531c-6.933,0-12.55-5.62-12.55-12.553c0-6.93,5.617-12.548,12.55-12.548
			c6.931,0,12.549,5.618,12.549,12.548C26.531,20.911,20.913,26.531,13.983,26.531z"/>
		<polygon  fill="#00eaff" points="15.579,17.158 16.191,4.579 11.804,4.579 12.414,17.158 		"/>
		<path   fill="#00eaff"d="M13.998,18.546c-1.471,0-2.5,1.029-2.5,2.526c0,1.443,0.999,2.528,2.444,2.528h0.056c1.499,0,2.469-1.085,2.469-2.528
			C16.441,19.575,15.468,18.546,13.998,18.546z"/>
	</g>
	<g id="Capa_1_207_">
	</g>
</g>
</svg>`,

repo: `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 90 90" fill="none">
<rect width="28" height="28" rx="24" fill="none"/>
<g 
         stroke="#00eaff"
         fill="none"
         stroke-width="3"
         stroke-linecap="round"
         stroke-linejoin="round">
      
         <path d="M30 20 H70 A3 3 0 0 1 73 23 V77 A3 3 0 0 1 70 80 H30 A5 5 0 0 1 25 75 V25 A5 5 0 0 1 30 20 Z" />
         
         <path d="M30 20 V73" stroke-width="2" />
         
         <path d="M45 75 V88 L50 85 L55 88 V75"
               fill="#45a891"
               fill-opacity="0.8" />
         
         <line x1="28" y1="73" x2="70" y2="73" stroke-width="3.0" />
      </g>
</svg>>`
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
