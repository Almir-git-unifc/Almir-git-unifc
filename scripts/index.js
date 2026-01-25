import fs from "fs";
import { Octokit } from "@octokit/rest";
import { trophySVG } from "./trophyTemplate.js";
import { rankByPoints } from "./rank.js";

// --- Configurações ---
const USER = "Almir-git-unifc"; // Seu username
const TOKEN = process.env.GITHUB_TOKEN; // GITHUB_TOKEN do workflow

if (!fs.existsSync("trophies")) fs.mkdirSync("trophies");

// --- GitHub API ---
const octokit = new Octokit({ auth: TOKEN });

// --- Funções de métrica ---
async function getPullRequests() {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `is:pr author:${USER}`,
  });
  return data.total_count;
}

async function getCommits() {
  const { data } = await octokit.search.commits({
    q: `author:${USER}`,
    per_page: 1,
    headers: { accept: "application/vnd.github.cloak-preview" },
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
  return data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
}

function getExperience(commits) {
  if (commits >= 1000) return 25;
  if (commits >= 500) return 16;
  if (commits >= 200) return 8;
  return 4;
}

function getProgress(points, rank) {
  const rankLimits = { "C": 0, "B": 50, "A": 100, "AA": 150, "AAA": 200 };
  const nextLimit = { "C": 50, "B": 100, "A": 150, "AA": 200, "AAA": 200 };
  return Math.min(100, ((points - rankLimits[rank]) / (nextLimit[rank] - rankLimits[rank])) * 100);
}

async function main() {
  const pullRequests = await getPullRequests();
  const commits = await getCommits();
  const repositories = await getRepositories();
  const stars = await getStars();
  const experience = getExperience(commits);

  console.log("METRICS:", { pullRequests, commits, repositories, stars, experience });

  const trophies = [
    { file: "pull_requests.svg", title: "Pull Requests", subtitle: "Ultra Puller", points: pullRequests },
    { file: "commits.svg", title: "Commits", subtitle: "High Committer", points: commits },
    { file: "repositories.svg", title: "Repositories", subtitle: "High Repo Creator", points: repositories },
    { file: "experience.svg", title: "Experience", subtitle: "Intermediate Dev", points: experience },
    { file: "stars.svg", title: "Stars", subtitle: "Middle Star", points: stars },
  ];

  for (const t of trophies) {
    const rank = rankByPoints(t.points);
    const progress = getProgress(t.points, rank);
    const svg = trophySVG({ ...t, rank, progress });
    fs.writeFileSync(`trophies/${t.file}`, svg);
  }

  console.log("✅ Trophies updated!");
}

main().catch(err => console.error(err));
