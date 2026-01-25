import fs from "fs";
import {
  getPullRequests,
  getCommits,
  getRepositories,
  getStars,
  getExperience,
} from "./githubMetrics.js";

import { trophySVG } from "./trophyTemplate.js";
import { rankByPoints } from "./rank.js";

if (!fs.existsSync("trophies")) {
  fs.mkdirSync("trophies");
}

async function main() {
  const pullRequests = await getPullRequests();
  const commits = await getCommits();
  const repositories = await getRepositories();
  const stars = await getStars();
  const experience = await getExperience(commits);

  const trophies = [
    {
      file: "pull_requests.svg",
      title: "Pull Requests",
      subtitle: "Ultra Puller",
      points: pullRequests,
    },
    {
      file: "commits.svg",
      title: "Commits",
      subtitle: "High Committer",
      points: commits,
    },
    {
      file: "repositories.svg",
      title: "Repositories",
      subtitle: "High Repo Creator",
      points: repositories,
    },
    {
      file: "experience.svg",
      title: "Experience",
      subtitle: "Intermediate Dev",
      points: experience,
    },
    {
      file: "stars.svg",
      title: "Stars",
      subtitle: "Middle Star",
      points: stars,
    },
  ];

  for (const t of trophies) {
    const svg = trophySVG({
      ...t,
      rank: rankByPoints(t.points),
    });

    fs.writeFileSync(`trophies/${t.file}`, svg);
  }
}

main();
