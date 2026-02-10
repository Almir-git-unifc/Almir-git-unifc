import fs from "fs";
import { Octokit } from "@octokit/rest";

import { trophySVG } from "./trophyTemplate.js";
import { resolveRank } from "./resolveRank.js";
import {
  EXPERIENCE_RULES,
  STAR_RULES,
  PR_RULES,
  REPO_RULES,
  COMMIT_RULES,
} from "./trophyRules.js";

import {
  experienceScore,
  experienceProgress,
} from "./experienceUtils.js";

import { RANK_ICONS } from "./rankIcons.js";

// ===============================
// Configurações
// ===============================
const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN não definido");
  process.exit(1);
}

if (!fs.existsSync("trophies")) {
  fs.mkdirSync("trophies");
}

// ===============================
// GitHub API
// ===============================
const octokit = new Octokit({
  auth: TOKEN,
  headers: {
    accept: "application/vnd.github+json",
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


// Commits last year
async function getCommitsLastYear() {
  const { data } = await octokit.activity.listPublicEventsForUser({
    username: USER,
    per_page: 100,
  });

  const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;

  return data.filter(
    e =>
      e.type === "PushEvent" &&
      new Date(e.created_at).getTime() > oneYearAgo
  ).reduce((sum, e) => sum + e.payload.commits.length, 0);
}


async function getReposData() {
  const { data } = await octokit.repos.listForUser({
    username: USER,
    per_page: 100,
  });

  return {
    repositories: data.length,
    stars: data.reduce(
      (sum, repo) => sum + repo.stargazers_count,
      0
    ),
  };
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
  const [
    pullRequests,
    commits,
    repoData,
    experienceYears,
  ] = await Promise.all([
    getPullRequests(),
    getCommitsLastYear(),
    getReposData(),
    getGithubExperienceYears(),
  ]);

  const { repositories, stars } = repoData;

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
  const prRank = resolveRank(pullRequests, PR_RULES);
  const commitRank = resolveRank(commits, COMMIT_RULES);
  const repoRank = resolveRank(repositories, REPO_RULES);
  const starRank = resolveRank(stars, STAR_RULES);
  const expRank = resolveRank(experienceYears, EXPERIENCE_RULES);

  // ===============================
  // Experience custom logic
  // ===============================
  const expScore = experienceScore(experienceYears);
  const expProgress = experienceProgress(experienceYears);

  // ===============================
  // Trophies orchestration
  // ===============================
  const trophies = [
    {
      file: "pull_requests.svg",
      title: "Pull Requests",
      points: pullRequests,
      rank: prRank.rank,
      subtitle: prRank.subtitle,
      progress: 100,
      icon: RANK_ICONS[prRank.rank],
    },
    {
      file: "commits.svg",
      title: "Commits",
      points: commits,
      rank: commitRank.rank,
      subtitle: commitRank.subtitle,
      progress: 100,
      icon: RANK_ICONS[commitRank.rank],
    },
    {
      file: "repositories.svg",
      title: "Repositories",
      points: repositories,
      rank: repoRank.rank,
      subtitle: repoRank.subtitle,
      progress: 100,
      icon: RANK_ICONS[repoRank.rank],
    },
    {
      file: "stars.svg",
      title: "Stars",
      points: stars,
      rank: starRank.rank,
      subtitle: starRank.subtitle,
      progress: 100,
      icon: RANK_ICONS[starRank.rank],
    },
    {
      file: "experience.svg",
      title: "Experience",
      points: expScore,
      rank: expRank.rank,
      subtitle: expRank.subtitle,
      progress: expProgress,
      icon: RANK_ICONS[expRank.rank],
    },
  ];

  // ===============================
  // SVG generation
  // ===============================
async function main() {
  try {
    ...
    for (const trophy of trophies) {
      const svg = trophySVG(trophy);
      fs.writeFileSync(`trophies/${trophy.file}`, svg);
    }

// Fim do arquivo scripts/index.js
    console.log("🏆 Trophies generated successfully!");
  } 
  catch (err) {
    console.error("⚠️ Metrics error, generating fallback trophies", err);

    // Gera SVGs vazios para evitar 404
    const fallback = trophySVG({
      title: "Unavailable",
      subtitle: "GitHub API limit",
      points: 0,
      rank: "C",
      progress: 0,
      icon: "⚠️",
    });

    fs.writeFileSync("trophies/stars.svg", fallback);
  }
}
