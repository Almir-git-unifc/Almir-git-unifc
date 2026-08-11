import fs from "fs";
import { Octokit } from "@octokit/rest";

// Adicione a importação no topo do scripts/index.js
import { donut } from "./svgUtils.js";

// Módulos locais de troféus
import { trophySVG } from "./trophyTemplate.js";
import { resolveRank } from "./resolveRank.js";
import { calculateProgress } from "./progressUtils.js";
import { experienceScore, experienceProgress } from "./experienceUtils.js";
import { RANK_ICONS } from "./rankIcons.js";
import {
  STAR_RULES,
  PR_RULES,
  REPO_RULES,
  COMMIT_RULES,
  EXPERIENCE_RULES,
} from "./trophyRules.js";

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN não definido.");
  process.exit(1);
}

// Garantir que os diretórios existam
["github-stats", "trophies"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const octokit = new Octokit({ auth: TOKEN });

/* =========================
   BUSCA DE DADOS GITHUB API
========================= */

async function getRepos() {
  let page = 1;
  let repos = [];
  let stars = 0;

  while (true) {
    const { data } = await octokit.rest.repos.listForUser({
      username: USER,
      per_page: 100,
      page,
    });
    if (!data.length) break;
    repos = [...repos, ...data];
    data.forEach((r) => (stars += r.stargazers_count || 0));
    page++;
  }
  return { repos, stars, repoCount: repos.length };
}

async function getPRs() {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `author:${USER} type:pr`,
  });
  return data.total_count || 0;
}

async function getIssues() {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `author:${USER} type:issue`,
  });
  return data.total_count || 0;
}

async function getCommits() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const query = `
    query($login:String!,$from:DateTime!,$to:DateTime!) {
      user(login:$login) {
        createdAt
        contributionsCollection(from:$from,to:$to) {
          totalCommitContributions
          totalRepositoriesWithContributedCommits
        }
      }
    }
  `;

  const result = await octokit.graphql(query, {
    login: USER,
    from: oneYearAgo.toISOString(),
    to: new Date().toISOString(),
  });

  const createdAt = new Date(result.user.createdAt);
  const now = new Date();
  const yearsExp = Math.max(0.5, (now - createdAt) / (1000 * 60 * 60 * 24 * 365));

  return {
    commits: result.user.contributionsCollection.totalCommitContributions,
    contributed: result.user.contributionsCollection.totalRepositoriesWithContributedCommits,
    yearsExp,
  };
}

async function getLanguages(repos) {
  const map = {};
  for (const repo of repos) {
    if (!repo.language) continue;
    map[repo.language] = (map[repo.language] || 0) + 1;
  }
  return map;
}

/* =========================
   GERAÇÃO DOS SVG DE STATS
========================= */

const ICONS = {
  star: `<svg width="14" height="14" viewBox="0 0 24 24"><path fill="#00eaff" d="M12 2l3 7 7 .6-5.3 4.6 1.6 7-6.3-3.8-6.3 3.8 1.6-7L2 9.6 9 9z"/></svg>`,
  commit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00eaff" stroke-width="3"><polyline points="12 6 12 12 16 14"/><path d="M2 13.24a9.67 9.67 0 0 0 2.71 5.83 10.2 10.2 0 0 0 14.32 0 9.89 9.89 0 0 0 0-14.14 10.2 10.2 0 0 0-13.52-.7C5.24 4.44 2.26 7.74 2 8"/><path d="M6 9H1V4"/></svg>`,
  pr: `
   <svg fill="#0678de" width="15px" height="15px"  stroke-width="3" viewBox="0 0 14 14" role="img" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
     <path fill="#00eaff" d="M 3.8000778,1.800156 C 2.9170015,1.800156 2.200234,2.516924 2.200234,3.4 c 0,0.590279 0.3237166,1.100917 0.8001562,1.378723 l 0,5.243178 C 2.524419,10.299239 2.200234,10.809409 2.200234,11.400156 2.200234,12.282764 2.9170015,13 3.8000778,13 c 0.8830764,0 1.5998439,-0.717236 1.5998439,-1.599844 0,-0.590747 -0.3232481,-1.100917 -0.8001562,-1.378255 l 0,-5.243178 C 5.0766736,4.500917 5.3999217,3.990279 5.3999217,3.4 c 0,-0.883076 -0.7167675,-1.599844 -1.5998439,-1.599844 z m 0,10.399688 c -0.4413039,0 -0.8001561,-0.357915 -0.8001561,-0.800156 0,-0.441304 0.3583837,-0.800156 0.8001561,-0.800156 0.4427094,0 0.8001562,0.358383 0.8001562,0.800156 0,0.442241 -0.3574468,0.800156 -0.8001562,0.800156 z m 0,-7.999688 C 3.3587739,4.200156 2.9999217,3.842709 2.9999217,3.4 c 0,-0.442709 0.3583837,-0.800156 0.8001561,-0.800156 0.4427094,0 0.8001562,0.357447 0.8001562,0.800156 0,0.442709 -0.3574468,0.800156 -0.8001562,0.800156 z m 7.2000002,5.821745 0,-5.022057 c 0,-2.40609 -2.4,-2.4 -2.4,-2.4 l -0.800156,0 0,-1.599844 -2.4000003,2.4 2.4000003,2.4 0,-1.599844 c 0,0 0.333554,0 0.800156,0 0.705524,0 0.800156,0.800156 0.800156,0.800156 l 0,5.021589 c -0.47644,0.277338 -0.800156,0.786571 -0.800156,1.378255 0,0.882608 0.717236,1.599844 1.599844,1.599844 0.882608,0 1.599844,-0.717236 1.599844,-1.599844 0,-0.590747 -0.323717,-1.100917 -0.800157,-1.378255 z m -0.799688,2.177943 c -0.441304,0 -0.800156,-0.357915 -0.800156,-0.800156 0,-0.441304 0.358384,-0.800156 0.800156,-0.800156 0.442241,0 0.800156,0.358383 0.800156,0.800156 0,0.442241 -0.357915,0.800156 -0.800156,0.800156 z"/>
   </svg>
  `,
  issue: `
   <svg fill="#0678de" height="15px" width="15px" stroke="#00eaff" stroke-width="3" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 27.963 27.963" xml:space="preserve">
    <g>
		 <path fill="#0678de" d="M13.983,0C6.261,0,0.001,6.259,0.001,13.979c0,7.724,6.26,13.984,13.982,13.984s13.98-6.261,13.98-13.984 C27.963,6.259,21.705,0,13.983,0z M13.983,26.531c-6.933,0-12.55-5.62-12.55-12.553c0-6.93,5.617-12.548,12.55-12.548 c6.931,0,12.549,5.618,12.549,12.548C26.531,20.911,20.913,26.531,13.983,26.531z"/>
		 <polygon  points="15.579,17.158 16.191,4.579 11.804,4.579 12.414,17.158"/>
		 <path fill="#0678de" d="M13.998,18.546c-1.471,0-2.5,1.029-2.5,2.526c0,1.443,0.999,2.528,2.444,2.528h0.056c1.499,0,2.469-1.085,2.469-2.528 C16.441,19.575,15.468,18.546,13.998,18.546z"/>
    </g>
   </svg>`,
  repo: `<svg xmlns="http://www.w3.org/2000/svg" fill="#0678de" width="15px" height="15px"  stroke-width="3" viewBox="0 0 24 24">
    <g>
        <path fill="none" d="M0 0h24v24H0z"/>
        <path fill="#00eaff" d="M13 21v2.5l-3-2-3 2V21h-.5A3.5 3.5 0 0 1 3 17.5V5a3 3 0 0 1 3-3h14a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-7zm-6-2v-2h6v2h6v-3H6.5a1.5 1.5 0 0 0 0 3H7zM7 10v3h12V5H7zm0  "/>
    </g>
  </svg>`,
};



// Substituido função SVGStats por calculateOverallRank(data)  + nova statsSVG(data)
// Função auxiliar para calcular o percentual do Donut e o Rank
function calculateOverallRank(data) {
  // Exemplo de cálculo ponderado de pontuação com base nos dados
  const totalScore = 
    (data.stars * 3) + 
    (data.commits * 0.2) + 
    (data.prs * 2) + 
    (data.issues * 1) + 
    (data.contributed * 2.5);

  // Define uma meta de pontos para 100% de preenchimento do Donut (ex: 500)
  const percent = Math.min(Math.round((totalScore / 500) * 100), 100);

  let rank = "C";
  if (percent >= 90) rank = "S";
  else if (percent >= 75) rank = "A+";
  else if (percent >= 60) rank = "A";
  else if (percent >= 45) rank = "B+";
  else if (percent >= 30) rank = "B";

  return { percent, rank };
}

function statsSVG(data) {
  const { percent, rank } = calculateOverallRank(data);
  const donutGraphic = donut(percent, rank);

  return `
<svg width="580" height="200" xmlns="http://www.w3.org/2000/svg">
  <!-- Fundo do Card -->
  <rect width="580" height="200" rx="12" fill="#315e7f" stroke="#1b3c55" stroke-width="1.5"/>

  <!-- Título -->
  <text x="25" y="32" font-size="18" fill="#ffffff" font-family="Arial" font-weight="bold">${USER} GitHub Stats</text>

  <!-- Lista de Estatísticas (Lado Esquerdo) -->
  <g font-family="Arial" font-size="14" fill="#66d1a1">
    <g transform="translate(25, 58)">${ICONS.star}<text x="22" y="12">Total Stars Earned: ${data.stars}</text></g>
    <g transform="translate(25, 83)">${ICONS.commit}<text x="22" y="12">Commits (last year): ${data.commits}</text></g>
    <g transform="translate(25, 108)">${ICONS.pr}<text x="22" y="12">Total PRs: ${data.prs}</text></g>
    <g transform="translate(25, 133)">${ICONS.issue}<text x="22" y="12">Total Issues: ${data.issues}</text></g>
    <g transform="translate(25, 158)">${ICONS.repo}<text x="22" y="12">Contributed to: ${data.contributed}</text></g>
  </g>

  <!-- Gráfico Donut (Lado Direito) -->
  ${donutGraphic}
</svg>`;
}




function languagesSVG(langs) {
  let y = 60;
  let rows = "";
  const total = Object.values(langs).reduce((a, b) => a + b, 0) || 1;

  Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .forEach(([lang, val]) => {
      const percent = ((val / total) * 100).toFixed(1);
      rows += `
      <text x="20" y="${y}" fill="#66d1a1" font-size="12">${lang}</text>
      <rect x="120" y="${y - 10}" width="140" height="8" fill="#1f2f3a" rx="4"/>
      <rect x="120" y="${y - 10}" width="${percent * 1.4}" height="8" fill="#00eaff" rx="4"/>
      <text x="310" y="${y}" fill="#66d1a1" font-size="12" text-anchor="end">${percent}%</text>`;
      y += 25;
    });

  return `
<svg width="360" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="360" height="200" rx="12" fill="#315e7f" stroke="#1b3c55" stroke-width="1.5"/>
  <text x="20" y="25" font-size="18" fill="#ffffff" font-family="Arial" font-weight="bold">Top Languages</text>
  ${rows}
</svg>`;
}

/* =========================
   GERAÇÃO DOS TROFÉUS (TROPHIES)
========================= */

function buildTrophy(title, val, rules) {
  const { rank, subtitle } = resolveRank(val, rules);
  const progress = calculateProgress(val, rules);
  const icon = RANK_ICONS[rank] || RANK_ICONS["C"];

  return trophySVG({
    title,
    subtitle,
    points: val,
    rank,
    progress,
    icon,
  });
}

function buildExpTrophy(years) {
  const { rank, subtitle } = resolveRank(years, EXPERIENCE_RULES);
  const points = experienceScore(years);
  const progress = experienceProgress(years);
  const icon = RANK_ICONS[rank] || RANK_ICONS["C"];

  return trophySVG({
    title: "Experience",
    subtitle,
    points,
    rank,
    progress,
    icon,
  });
}

/* =========================
   EXECUÇÃO PRINCIPAL
========================= */

async function main() {
  try {
    const { repos, stars, repoCount } = await getRepos();
    const prs = await getPRs();
    const issues = await getIssues();
    const { commits, contributed, yearsExp } = await getCommits();
    const languages = await getLanguages(repos);

    // 1. Salvar Cards em github-stats/
    fs.writeFileSync("github-stats/stats.svg", statsSVG({ stars, commits, prs, issues, contributed }));
    fs.writeFileSync("github-stats/languages.svg", languagesSVG(languages));

    // 2. Salvar Troféus em trophies/
    fs.writeFileSync("trophies/stars.svg", buildTrophy("Stars", stars, STAR_RULES));
    fs.writeFileSync("trophies/pull_requests.svg", buildTrophy("Pull Requests", prs, PR_RULES));
    fs.writeFileSync("trophies/repositories.svg", buildTrophy("Repositories", repoCount, REPO_RULES));
    fs.writeFileSync("trophies/commits.svg", buildTrophy("Commits", commits, COMMIT_RULES));
    fs.writeFileSync("trophies/experience.svg", buildExpTrophy(yearsExp));

    console.log("✅ Estatísticas e troféus atualizados com sucesso!");
  } catch (err) {
    console.error("⚠️ Erro ao atualizar estatísticas:", err);
    process.exit(1);
  }
}

main();
