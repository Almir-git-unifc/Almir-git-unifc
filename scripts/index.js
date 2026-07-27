import fs from "fs";
import { Octokit } from "@octokit/rest";

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
  pr: `<svg width="15" height="15" viewBox="0 0 14 14"><path fill="#00eaff" d="M 3.8,1.8 C 2.9,1.8 2.2,2.5 2.2,3.4 c 0,0.5 0.3,1.1 0.8,1.3 v 5.2 C 2.5,10.2 2.2,10.8 2.2,11.4 c 0,0.8 0.7,1.5 1.5,1.5 0.8,0 1.5,-0.7 1.5,-1.5 0,-0.5 -0.3,-1.1 -0.8,-1.3 V 4.8 C 5,4.5 5.3,3.9 5.3,3.4 5.3,2.5 4.6,1.8 3.8,1.8 z"/></svg>`,
  issue: `<svg xmlns="http://www.w3.org/2000/svg" fill="#0678de" width="15px" height="15px"  stroke-width="3" viewBox="0 0 24 24">
    <g>
        <path fill="none" d="M0 0h24v24H0z"/>
        <path fill="#00eaff" d="M13 21v2.5l-3-2-3 2V21h-.5A3.5 3.5 0 0 1 3 17.5V5a3 3 0 0 1 3-3h14a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-7zm-6-2v-2h6v2h6v-3H6.5a1.5 1.5 0 0 0 0 3H7zM7 10v3h12V5H7zm0  "/>
    </g>
  </svg>`,
  repo: `<svg width="15" height="15" viewBox="0 0 24 24"><path fill="#00eaff" d="M13 21v2.5l-3-2-3 2V21h-.5A3.5 3.5 0 0 1 3 17.5V5a3 3 0 0 1 3-3h14a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-7z"/></svg>`,
};

function statsSVG(data) {
  return `
<svg width="420" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="420" height="200" rx="12" fill="#315e7f" stroke="#1b3c55" stroke-width="1.5"/>
  <text x="20" y="30" font-size="18" fill="#ffffff" font-family="Arial" font-weight="bold">${USER} GitHub Stats</text>
  <g font-family="Arial" font-size="14" fill="#66d1a1">
    <g transform="translate(30,60)">${ICONS.star}<text x="20" y="12">Total Stars Earned: ${data.stars}</text></g>
    <g transform="translate(30,85)">${ICONS.commit}<text x="20" y="12">Commits (last year): ${data.commits}</text></g>
    <g transform="translate(30,110)">${ICONS.pr}<text x="20" y="12">Total PRs: ${data.prs}</text></g>
    <g transform="translate(30,135)">${ICONS.issue}<text x="20" y="12">Total Issues: ${data.issues}</text></g>
    <g transform="translate(30,160)">${ICONS.repo}<text x="20" y="12">Contributed to: ${data.contributed}</text></g>
  </g>
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
