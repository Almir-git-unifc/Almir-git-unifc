import fs from "fs";
import { Octokit } from "@octokit/rest";

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

const octokit = new Octokit({ auth: TOKEN });

const repos = [
  "full-stack_crud_mongodb",
  "budget-controll_react-native",
  "single-page-app_portfolio",
  "ToDo-List_react"
];

if (!fs.existsSync("pinned")) {
  fs.mkdirSync("pinned");
}

function createCard({ name, description, language, stars, langColor }) {
  return `
<svg width="400" height="130" viewBox="0 0 400 130" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" rx="15"
        fill="#315e7f"
        stroke="#5d5e60"
        stroke-width="1.5"/>

  <!-- Linha 1 -->
  <text x="20" y="35" font-size="18" fill="#39ff14">📁</text>
  <text x="45" y="35"
        font-size="18"
        font-weight="bold"
        fill="#eff0f2">${name}</text>

  <!-- Linha 2 -->
  <text x="20" y="60"
        font-size="14"
        fill="#959ea4">
        ${description || "Sem descrição"}
  </text>

  <!-- Linha 3 -->
  <circle cx="20" cy="95" r="6" fill="${langColor || "#f1e05a"}"/>
  <text x="35" y="100"
        font-size="13"
        fill="#959ea4">${language || "Unknown"}</text>

  <text x="250" y="100"
        font-size="16"
        fill="#39ff14">☆</text>

  <text x="270" y="100"
        font-size="13"
        fill="#959ea4">${stars}</text>
</svg>
`;
}

async function main() {
  for (const repoName of repos) {
    const { data } = await octokit.repos.get({
      owner: USER,
      repo: repoName
    });

    const svg = createCard({
      name: data.name,
      description: data.description,
      language: data.language,
      stars: data.stargazers_count,
      langColor: "#f1e05a"
    });

    fs.writeFileSync(`pinned/${repoName}.svg`, svg);
  }

  console.log("Pinned cards generated!");
}

main();
