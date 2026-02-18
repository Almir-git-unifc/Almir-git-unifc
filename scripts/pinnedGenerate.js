import fs from "fs";
import { Octokit } from "@octokit/rest";

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN não definido");
  process.exit(1);
}

const octokit = new Octokit({ auth: TOKEN });

// 🔹 Defina aqui os 4 repositórios
const repos = [
  "full-stack_crud_mongodb",
  "budget-controll_react-native",
  "single-page-app_portfolio",
  "ToDo-List_react"
];


// Criar pasta pinned se não existir
if (!fs.existsSync("pinned")) {
  fs.mkdirSync("pinned");
}

// ===============================
// 🎨 Cores oficiais principais
// ===============================
const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  PHP: "#4F5D95",
  Go: "#00ADD8",
  Rust: "#dea584",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c"
};

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
// 📝 Quebra automática descrição
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

  if (currentLine) lines.push(currentLine.trim());

  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] =
      lines[maxLines - 1].slice(0, maxChars - 3) + "...";
  }

  return lines;
}

// ===============================
// ⭐ Estrela SVG (maior + espessa)
// ===============================
function starSVG() {
  return `
  <path d="M0 -2
           l5 10 11 1 -8 8 3 11 -11 -6 -11 6 3 -11 -8 -8 11 -1z"
        fill="none"
        stroke="#45a891"
        stroke-width="2.4"
        stroke-linejoin="round"
        stroke-linecap="round"/>`;
}

// ===============================
// 📘 Ícone Livro (outline)
// ===============================
function bookIconSVG() {
  return `
  <g stroke="#45a891" stroke-width="2.2" fill="none">
    <rect x="28" y="25" width="20" height="24" rx="4"/>
    <line x1="38" y1="25" x2="38" y2="49"/>
    <path d="M38 25 l7 -5 v24 l-7 5"/>
  </g>`;
}

// ===============================
// 🎨 Criar Card
// ===============================
function createCard({ name, description, language, stars, langColor }) {
  name = escapeXML(name);
  description = escapeXML(description || "Sem descrição");

  const descLines = wrapText(description, 52, 2);

  return `
<svg width="420" height="170" viewBox="0 0 420 170" xmlns="http://www.w3.org/2000/svg">

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

  ${bookIconSVG()}

  <!-- Title -->
  <text x="65" y="42"
        font-size="19"
        font-weight="600"
        fill="#eff0f2"
        font-family="Segoe UI, Arial, sans-serif">
        ${name}
  </text>

  <!-- Description -->
  <text x="30" y="85"
        font-size="14"
        fill="#959ea4"
        font-family="Segoe UI, Arial, sans-serif">

    <tspan x="30" dy="0">${descLines[0] || ""}</tspan>
    ${descLines[1] ? `<tspan x="30" dy="20">${descLines[1]}</tspan>` : ""}

  </text>

  <!-- Language + Stars -->
  <g transform="translate(30,135)">

    <!-- Language Circle -->
    <circle cx="0" cy="0" r="8"
            fill="${langColor}"/>

    <!-- Language -->
    <text x="18" y="5"
          font-size="13"
          font-family="Segoe UI, Arial, sans-serif"
          fill="#959ea4">
      ${language}
    </text>

    <!-- Star + Count -->
    <g transform="translate(190,0)">
      ${starSVG()}
      <text x="20" y="5"
            font-size="13"
            font-family="Segoe UI, Arial, sans-serif"
            fill="#959ea4">
        ${stars}
      </text>
    </g>

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

      const langData = await octokit.repos.listLanguages({
        owner: USER,
        repo: repoName
      });

      const sorted = Object.entries(langData.data)
        .sort((a, b) => b[1] - a[1]);

      const mainLanguage = sorted.length ? sorted[0][0] : "Unknown";
      const langColor =
        LANGUAGE_COLORS[mainLanguage] || "#cccccc";

      const svg = createCard({
        name: data.name,
        description: data.description,
        language: mainLanguage,
        stars: data.stargazers_count,
        langColor
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
