import fs from "fs";
import { Octokit } from "@octokit/rest";

// =============================
// CONFIG
// =============================

const USER = process.env.GITHUB_ACTOR || "Almir-git-unifc";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error("❌ GITHUB_TOKEN not defined");
  process.exit(1);
}

if (!fs.existsSync("github-stats")) {
  fs.mkdirSync("github-stats", { recursive: true });
}

const octokit = new Octokit({ auth: TOKEN });


// =============================
// HELPERS
// =============================

function calculateRank(score) {
  if (score > 95) return "S++";
  if (score > 90) return "S+";
  if (score > 85) return "S";
  if (score > 75) return "A+";
  if (score > 65) return "A";
  if (score > 55) return "A-";
  if (score > 45) return "B+";
  if (score > 35) return "B";
  if (score > 25) return "B-";
  return "C";
}


function donut(percent, rank) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (percent / 100);

  return `
  <g transform="translate(460,120)">
    
    <circle
      r="${radius}"
      cx="0"
      cy="0"
      fill="none"
      stroke="#2a2a2a"
      stroke-width="10"
    />

    <circle
      r="${radius}"
      cx="0"
      cy="0"
      fill="none"
      stroke="#66d1a1"
      stroke-width="10"
      stroke-dasharray="${progress} ${circumference}"
      transform="rotate(-90)"
    />

    <text
      x="0"
      y="6"
      text-anchor="middle"
      font-size="20"
      fill="#66d1a1"
      font-family="Arial"
    >
      ${rank}
    </text>

  </g>
  `;
}


// =============================
// API CALLS
// =============================

async function getStarsAndRepos() {
  const repos = await octokit.paginate(
    octokit.repos.listForUser,
    { username: USER, per_page: 100 }
  );

  const stars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  return { stars, repos };
}



async function getPullRequests() {
  const { data } =
    await octokit.search.issuesAndPullRequests({
      q: `is:pr author:${USER} is:merged`,
      per_page: 1
    });

  return data.total_count || 0;
}



async function getIssues() {
  const { data } =
    await octokit.search.issuesAndPullRequests({
      q: `type:issue author:${USER}`,
      per_page: 1
    });

  return data.total_count || 0;
}



async function getCommitsLastYear() {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const query = `
  query($login:String!,$from:DateTime!,$to:DateTime!) {
    user(login:$login) {
      contributionsCollection(from:$from,to:$to) {
        totalCommitContributions
        totalRepositoriesWithContributedCommits
      }
    }
  }`;

  const res = await octokit.graphql(query, {
    login: USER,
    from: oneYearAgo.toISOString(),
    to: new Date().toISOString()
  });

  return {
    commits:
      res.user.contributionsCollection
        .totalCommitContributions,

    contributed:
      res.user.contributionsCollection
        .totalRepositoriesWithContributedCommits
  };
}



// =============================
// LANGUAGES
// =============================

async function getLanguages(repos) {
  const map = {};

  for (const repo of repos) {

    try {

      const { data } =
        await octokit.repos.listLanguages({
          owner: USER,
          repo: repo.name
        });

      for (const lang in data) {

        map[lang] = (map[lang] || 0) + data[lang];
      }

    } catch {
      continue;
    }
  }
  return map;
}



// =============================
// SVG GENERATORS
// =============================

function statsSVG(data) {
  const score =
    (data.stars +
      data.prs * 2 +
      data.commits / 10 +
      data.repos) /
    10;

  const percent = Math.min(score, 100);

  const rank = calculateRank(percent);

  return `
<svg width="600" height="220"
xmlns="http://www.w3.org/2000/svg">

<rect
width="600"
height="220"
rx="12"
fill="none"
stroke="white"
/>

<text
x="30"
y="40"
font-size="20"
fill="#f7f7f8"
font-family="Arial"
>
${USER} GitHub Stats
</text>

<g font-size="15"
fill="#66d1a1"
font-family="Arial">

<text x="60" y="80">
⭐ Total Stars Earned: ${data.stars}
</text>

<text x="60" y="105">
⏱ Total Commits (last year): ${data.commits}
</text>

<text x="60" y="130">
🔀 Total PRs: ${data.prs}
</text>

<text x="60" y="155">
❗ Total Issues: ${data.issues}
</text>

<text x="60" y="180">
🤝 Contributed to: ${data.contributed}
</text>

</g>

${donut(percent, rank)}

</svg>
`;
}



function languagesSVG(languages) {
  const entries =
    Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

  const total =
    entries.reduce((s, [, v]) => s + v, 0);

  let y = 70;

  let bars = "";

  for (const [lang, val] of entries) {

    const pct = (val / total) * 100;

    const width = 420 * (pct / 100);

    bars += `

<text
x="40"
y="${y}"
fill="#66d1a1"
font-size="14"
font-family="Arial"
>
${lang}
</text>

<rect
x="40"
y="${y + 8}"
width="420"
height="8"
fill="white"
rx="4"
/>

<rect
x="40"
y="${y + 8}"
width="${width}"
height="8"
fill="#037eeb"
rx="4"
/>

<text
x="470"
y="${y + 15}"
fill="#66d1a1"
font-size="12"
font-family="Arial"
>
${pct.toFixed(2)}%
</text>
`;

    y += 40;
  }

  return `
<svg width="600" height="220"
xmlns="http://www.w3.org/2000/svg">

<rect
width="600"
height="220"
rx="12"
fill="none"
stroke="white"
/>

<text
x="40"
y="40"
font-size="20"
fill="#f7f7f8"
font-family="Arial"
>
Linguagens mais usadas
</text>

${bars}

</svg>
`;
}


// =============================
// MAIN
// =============================

async function main() {

  try {
    const { stars, repos } =
      await getStarsAndRepos();

    const prs = await getPullRequests();

    const issues = await getIssues();

    const { commits, contributed } =
      await getCommitsLastYear();

    const languages =
      await getLanguages(repos);

    const stats = {
      stars,
      prs,
      issues,
      commits,
      contributed,
      repos: repos.length
    };

    const statsCard = statsSVG(stats);

    const langCard =
      languagesSVG(languages);

    fs.writeFileSync(
      "github-stats/stats.svg",
      statsCard
    );

    fs.writeFileSync(
      "github-stats/languages.svg",
      langCard
    );

    console.log("✅ Stats cards generated");

  } catch (err) {

    console.error("⚠️ Error:", err);

    process.exit(1);
  }
}

main();

