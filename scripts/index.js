import fs from "fs";
import { Octokit } from "@octokit/rest";

import { trophySVG } from "./trophyTemplate.js";
import { resolveRank } from "./resolveRank.js";
import {
  EXPERIENCE_RULES,
  STAR_RULES,
  PR_RULES,
} from "./trophyRules.js";

import {
  experienceScore,
  experienceProgress,
} from "./experienceUtils.js";

import { RANK_ICONS } from "./rankIcons.js";

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
const octokit = new Octokit({
  auth: TOKEN,
  headers: {
    accept: "application/vnd.github.cloak-preview",
  },
});

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

async function getCommitsLastYear() {
  const since = new Date();
  since.setFullYear(since.getFullYear() - 1);

  const { data } = await octokit.search.commits({
    q: `author:${USER} committer-date:>${since.toISOString()}`,
    per_page: 1,
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
  const commits = await getCommitsLastYear(); // útil para cards futuros
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

  // ===============================
  // Rankings
  // ===============================
  const prData = resolveRank(pullRequests, PR_RULES);
  const starData = resolveRank(stars, STAR_RULES);
  const expData = resolveRank(experienceYears, EXPERIENCE_RULES);

  // ===============================
  // Experience custom logic
  // ===============================
  const expScore = experienceScore(experienceYears);
  const expProgress = experienceProgress(experienceYears);

  // ===============================
  // Trophies definition (orquestração)
  // ===============================
  const trophies = [
    {
      file: "pull_requests.svg",
      title: "Pull Requests",
      points: pullRequests,
      rank: prData.rank,
      subtitle: prData.subtitle,
      progress: 100,
      icon: RANK_ICONS[prData.rank],
    },
    {
      file: "stars.svg",
      title: "Stars",
      points: stars,
      rank: starData.rank,
      subtitle: starData.subtitle,
      progress: 100,
      icon: RANK_ICONS[starData.rank],
    },
    {
      file: "experience.svg",
      title: "Experience",
      points: expScore,
      rank: expData.rank,
      subtitle: expData.subtitle,
      progress: expProgress,
      icon: RANK_ICONS[expData.rank],
    },
  ];

  // ===============================
  // SVG generation
  // ===============================
  for (const t of trophies) {
    const svg = trophySVG({
      title: t.title,
      subtitle: t.subtitle,
      points: t.points,
      rank: t.rank,
      progress: t.progress,
      icon: t.icon,
    });

    fs.writeFileSync(`trophies/${t.file}`, svg);
  }

  console.log("🏆 Trophies generated successfully!");
}

main().catch((err) => {
  console.error("❌ Error generating trophies:", err);
  process.exit(1);
});
