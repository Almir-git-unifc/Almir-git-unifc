import fs from "fs";
import { Octokit } from "@octokit/rest";
import { trophySVG } from "./trophyTemplate.js";
import { resolveRank } from "./resolveRank.js";
import {
  EXPERIENCE_RULES,
  STAR_RULES,
  PR_RULES,
} from "./trophyRules.js";

// ===============================
// Configurações
// ===============================
const USER = "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!fs.existsSync("trophies")) {
  fs.mkdirSync("trophies");
}

// ===============================
// GitHub API
// ===============================
const octokit = new Octokit({ auth: TOKEN });

// ===============================
// Métricas GitHub
// ===============================
async function getPullRequests() {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `is:pr author:${USER} is:merged`,
    per_page: 1,
  });

  return data.total_count;
}

async function getCommits() {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const { data } = await octokit.search.commits({
    q: `author:${USER} committer-date:>${since.toISOString()}`,
    per_page: 1,
    headers: {
      accept: "application/vnd.github.cloak-preview",
    },
  });

  return data.total_count;
}

async function getRepositories() {
  const { data } = await octokit.repos.listForUser({
    username: USER,
    per_page: 100,
  });

  return data.length;
}

async function getStars() {
  const { data } = await octokit.repos.listForUser({
    username: USER,
    per_page: 100,
  });

  return data.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
}

async function getGithubExperienceYears() {
  const { data } = await octokit.users.getByUsername({
    username: USER,
  });

  const createdAt = new Date(data.created_at);
  const now = new Date();

  const years =
    (now - createdAt) / (1000 * 60 * 60 * 24 * 365.25);

  return Number(years.toFixed(1));
}

// ===============================
// Main
// ===============================
async function main() {
  const pullRequests = await getPullRequests();
  const commits = await getCommits(); // ainda útil pra outros cards
  const repositories = await getRepositories();
  const stars = await getStars();
  const experienceYears = await getGithubExperienceYears();

  console.log("📊 METRICS", {
    pullRequests,
    commits,
    repositories,
    stars,
    experienceYears,
  });

  // Resolve ranking por tipo
  const prData   = resolveRank(pullRequests, PR_RULES);
  const starData = resolveRank(stars, STAR_RULES);
  const expData  = resolveRank(experienceYears, EXPERIENCE_RULES);

  const trophies = [
    {
      file: "pull_requests.svg",
      title: "Pull Requests",
      points: pullRequests,
      ...prData,
    },
    {
      file: "stars.svg",
      title: "Stars",
      points: stars,
      ...starData,
    },
    {
      file: "experience.svg",
      title: "Experience",
      points: experienceYears,
      ...expData,
    },
  ];

  for (const t of trophies) {
    const svg = trophySVG({
      title: t.title,
      subtitle: t.subtitle,
      points: t.points,
      rank: t.rank,
      progress: 100, // pode evoluir depois p/ progresso real
    });

    fs.writeFileSync(`trophies/${t.file}`, svg);
  }

  console.log("🏆 Trophies generated successfully!");
}

main().catch((err) => {
  console.error("❌ Error generating trophies:", err);
  process.exit(1);
});
