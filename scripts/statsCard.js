export function statsCard(data){

const {
user,
stars,
commits,
prs,
issues,
contributed,
rank
}=data

return `
<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">

<rect
x="0"
y="0"
width="600"
height="220"
rx="10"
fill="#315e7f"
stroke="white"
/>

<text x="30" y="40"
font-size="20"
fill="#f7f7f8"
font-family="Arial"
>
${user} GitHub Stats
</text>

<g fill="#66d1a1" font-size="15">

<text x="60" y="80">Total Stars Earned: ${stars}</text>
<text x="60" y="105">Total Commits (last year): ${commits - 19}</text>
<text x="60" y="130">Total PRs: ${prs}</text>
<text x="60" y="155">Total Issues: ${issues}</text>
<text x="60" y="180">Contributed to (last year): ${contributed}</text>

</g>

</svg>
`
}
