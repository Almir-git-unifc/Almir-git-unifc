export function languagesCard(langs){

const entries=Object.entries(langs)
.sort((a,b)=>b[1]-a[1])
.slice(0,5)

const total=entries.reduce((s,[,v])=>s+v,0)

let y=70

let bars=""

for(const [lang,val] of entries){

const pct=(val/total)*100
const width=400*(pct/100)

bars+=`

<text x="40" y="${y}" fill="#66d1a1" font-size="14">
${lang}
</text>

<rect
x="40"
y="${y+8}"
width="400"
height="8"
fill="white"
rx="4"
/>

<rect
x="40"
y="${y+8}"
width="${width}"
height="8"
fill="#037eeb"
rx="4"
/>

<text
x="450"
y="${y+15}"
fill="#66d1a1"
font-size="12"
>
${pct.toFixed(2)}%
</text>

`

y+=40
}

return `
<svg width="600" height="220">

<rect
x="0"
y="0"
width="600"
height="220"
rx="10"
fill="none"
stroke="white"
/>

<text
x="40"
y="40"
font-size="20"
fill="#f7f7f8"
>
Linguagens mais usadas
</text>

${bars}

</svg>
`
}
