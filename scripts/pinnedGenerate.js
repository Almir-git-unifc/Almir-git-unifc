import fs from "fs";
import { Octokit } from "@octokit/rest";

const USER = process.env.GITHUB_ACTOR || "SEU_USUARIO";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN não definido");
  process.exit(1);
}

const octokit = new Octokit({ auth: TOKEN });

// 🔹 Defina aqui os 4 repositórios
const repos = [
  "Todo_react",
  "Repo2",
  "Repo3",
  "Repo4"
];

// Criar pasta pinned se não existir
if (!fs.existsSync("pinned")) {
  fs.mkdirSync("pinned");
}

// ===============================
// 🔐 Escape XML
// ===============================
function escapeXML(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ===============================
// 📝 Quebra automática de texto
// ===============================
function wrapText(text = "", maxChars = 52, maxLines = 2) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  for (const word of words) {
    if ((currentLine + word).length <= maxChars) {
      currentLine += word + " ";
    } else {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    }
  }

  if (currentLine) {
    lines.push(currentLine.trim());
  }

  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] =
      lines[maxLines - 1].slice(0, maxChars - 3) + "...";
  }

  return lines;
}

// ===============================
// 🎨 Criar Card SVG
// ===============================
function createCard({ name, description, language, stars, langColor }) {
  name = escapeXML(name);
  description = escapeXML(description || "Sem descrição");

  const descLines = wrapText(description, 52, 2);

  return `
<svg width="420" height="160" viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg">

  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Card Background -->
  <rect width="100%" height="100%" rx="18"
        fill="#315e7f"
        stroke="#5d5e60"
        stroke-width="1.2"
        filter="url(#shadow)"/>

  <!-- Repo Icon -->
  <path d="M30 32 h14 v14 h-14 z M34 22 h6 v8 h-6 z"
        fill="#39ff14"/>

  <!-- Title -->
  <text x="55" y="42"
        font-size="19"
        font-weight="600"
        fill="#eff0f2"
        font-family="Segoe UI, Arial, sans-serif">
        ${name}
  </text>

  <!-- Description -->
  <text x="30" y="75"
        font-size="14"
        fill="#959ea4"
        font-family="Segoe UI, Arial, sans-serif">

    <tspan x="30" dy="0">${descLines[0] || ""}</tspan>
    ${descLines[1] ? `<tspan x="30" dy="20">${descLines[1]}</tspan>` : ""}

  </text>

  <!-- Language + Stars -->
  
  <g transform="translate(30,120)">

    <!-- Language Circle -->
    <circle cx="0" cy="5" r="8"
            fill="${langColor || "#f1e05a"}"/>

    <!-- Language + Star -->
    <text x="18" y="10"
          font-size="13"
          font-family="Segoe UI, Arial, sans-serif"
          fill="#959ea4">

      ${language || "Unknown"}

      <tspan dx="18" fill="#39ff14">☆</tspan>
      <tspan dx="6" fill="#959ea4">${stars}</tspan>
    </text>
  </g>

</svg>
`;
}

// ===============================
// 🚀 Main
// ===============================
async function main() {
  try {
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
        langColor: "#f1e05a" // você pode futuramente puxar cor real da linguagem
      });

      fs.writeFileSync(`pinned/${repoName}.svg`, svg);
    }

    console.log("✅ Pinned cards generated successfully!");
  } catch (error) {
    console.error("⚠️ Error generating pinned cards:", error);
    process.exit(1);
  }
}

main();
