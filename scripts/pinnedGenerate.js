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
// 🎨 Cores principais linguagens
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
  Kotlin: "#a97bff",
  Vue: "#41b883",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  Other: "#ededed"
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
// ⭐ Estrela centralizada corretamente
// ===============================
function starSVG(size = 11, color = "#45a891") {
  const baseSize = 24;
  const scale = size / baseSize;

  return `
  <g transform="
      translate(${-12 * scale}, ${-14 * scale})
      scale(${scale})
  ">
    <path d="M12 2
             L15 10
             L23 11
             L17 17
             L19 25
             L12 21
             L5 25
             L7 17
             L1 11
             L9 10 Z"
          fill="none"
          stroke="${color}"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"/>
  </g>`;
}

// ===============================
// 📘 Ícone Livro
// ===============================
function bookIconSVG() {
  return `
  <g stroke="#45a891" stroke-width="2" fill="none">
    <rect x="28" y="25" width="18" height="22" rx="4"/>
    <line x1="37" y1="25" x2="37" y2="47"/>
    <path d="M37 25 l6 -4 v22 l-6 4"/>
  </g>`;
}

// ===============================
// 🎨 Criar Card
// ===============================
function createCard({ name, description, language, stars, langColor }) {
  const textSize = 13;
  const starSize = 11;

  // 🔥 Cálculo dinâmico da posição da estrela
  const approxCharWidth = textSize * 0.6;
  const languageWidth = language.length * approxCharWidth;
  const starOffset = 18 + languageWidth + 16;

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

  <!-- Bottom Row -->
  <g transform="translate(30,135)">

    <!-- Language Circle -->
    <circle cx="0" cy="0" r="8"
            fill="${langColor}"/>

    <!-- Language -->
    <text x="18" y="0"
          font-size="${textSize}"
          fill="#959ea4"
          font-family="Segoe UI, Arial, sans-serif"
          dominant-baseline="middle">
      ${language}
    </text>

    <!-- Star + Count (posição dinâmica) -->
    <g transform="translate(${starOffset},0)">

      ${starSVG(starSize)}

      <text x="${starSize + 8}" y="0"
            font-size="${textSize}"
            fill="#959ea4"
            font-family="Segoe UI, Arial, sans-serif"
            dominant-baseline="middle">
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
