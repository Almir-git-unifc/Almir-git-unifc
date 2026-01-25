import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  previews: ["cloak-preview"], // commits search
});

const USER = process.env.GITHUB_ACTOR;

export async function getPullRequests() {
  const { data } = await octokit.search.issuesAndPullRequests({
    q: `is:pr author:${USER}`,
  });
  return data.total_count;
}

export async function getCommits() {
  const { data } = await octokit.search.commits({
    q: `author:${USER}`,
    per_page: 1,
  });
  return data.total_count;
}

export async function getRepositories() {
  const { data } = await octokit.repos.listForUser({
    username: USER,
    per_page: 100,
  });
  return data.length;
}

export async function getStars() {
  const { data } = await octokit.repos.listForUser({
    username: USER,
    per_page: 100,
  });
  return data.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );
}

export async function getExperience(commits) {
  if (commits >= 1000) return 25;
  if (commits >= 500) return 16;
  if (commits >= 200) return 8;
  return 4;
}
