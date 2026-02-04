import fs from "fs";
import { Octokit } from "@octokit/rest";
import { trophySVG } from "./trophyTemplate.js";
import { rankByPoints } from "./rank.js";
import { EXPERIENCE_RULES, STAR_RULES, PR_RULES } from "./trophyRules.js";
import { resolveRank } from "./resolveRank.js";

// --- Configurações ---
const USER = "Almir-git-unifc"; // Seu username
const TOKEN = process.env.GITHUB_TOKEN; // GITHUB_TOKEN do workflow

if (!fs.existsSync("trophies")) fs.mkdirSync("trophies");

// --- GitHub API ---
const octokit = new Octokit({ auth: TOKEN });

// --- Funções de métrica ---
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
  return data.reduce((sum, repo) => sum + repo.stargazers_count, 0);
}

function getExperience(commits) {
  if (commits >= 1000) return 25;
  if (commits >= 500) return 16;
  if (commits >= 200) return 8;
  return 4;
}

function getProgress(points, rank) {
  const limits = {
    C:  { min: 0,   max: 50 },
    B:  { min: 50,  max: 100 },
    A:  { min: 100, max: 150 },
    AA: { min: 150, max: 200 },
    AAA:{ min: 200, max: 200 },
  };

  const { min, max } = limits[rank];
  if (max === min) return 100;

  return Math.min(100, ((points - min) / (max - min)) * 100);
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

main(const pullRequests = await getPullRequests();
const commits = await getCommits();
const repositories = await getRepositories();
const stars = await getStars();
const experienceYears = await getGithubExperienceYears();

// Resolve ranks
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
];).catch(err => console.error(err));
