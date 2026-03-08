import { Octokit } from "@octokit/rest";

export function githubClient(token){
  return new Octokit({ auth: token });
}

export async function getUserStats(octokit, user){

  const { data: repos } = await octokit.repos.listForUser({
    username:user,
    per_page:100
  });

  const stars = repos.reduce((s,r)=>s+r.stargazers_count,0);

  const languages = {};

  for(const repo of repos){

    const { data } = await octokit.repos.listLanguages({
      owner:user,
      repo:repo.name
    });

    for(const lang in data){
      languages[lang]=(languages[lang]||0)+data[lang];
    }
  }

  return {
    stars,
    repos: repos.length,
    languages
  }
}
