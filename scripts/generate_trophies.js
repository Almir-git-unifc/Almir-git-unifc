import fs from "fs";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const USER = "SEU_USUARIO";

function generateSVG({ title, subtitle, score, grade }) {
  return `
<svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="120" rx="12" fill="#0d1117"/>
  <text x="20" y="35" fill="#58a6ff" font-size="20" font-family="Arial">
    ${title}
  </text>
  <text x="20" y="65" fill="#c9d1d9" font-size="16">
    ${subtitle}
  </text>
  <text x="20" y="95" fill="#3fb950" font-size="16">
    ${grade} • ${score} pts
  </text>
</svg>
`;
}

async function main() {
  // EXEMPLO: valores mockados (você pode calcular via API)
  const trophies = [
    {
      file: "pull_requests.svg",
      title: "Pull Requests",
      subtitle: "Ultra Puller",
      score: 154,
      grade: "AAA",
    },
    {
      file: "commits.svg",
      title: "Commits",
      subtitle: "High Committer",
      score: 176,
      grade: "A",
    },
    {
      file: "repositories.svg",
      title: "Repositories",
      subtitle: "High Repo Creator",
      score: 22,
      grade: "A",
    },
    {
      file: "experience.svg",
      title: "Experience",
      subtitle: "Intermediate Dev",
      score: 16,
      grade: "A",
    },
    {
      file: "stars.svg",
      title: "Stars",
      subtitle: "Middle Star",
      score: 23,
      grade: "B",
    },
  ];

  if (!fs.existsSync("trophies")) {
    fs.mkdirSync("trophies");
  }

  trophies.forEach((t) => {
    const svg = generateSVG(t);
    fs.writeFileSync(`trophies/${t.file}`, svg);
  });
}

main();
