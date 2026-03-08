export function donut(percent){

const radius=45
const circumference=2*Math.PI*radius
const progress=circumference*(percent/100)

return `
<g transform="translate(430,120)">

<circle
r="${radius}"
cx="0"
cy="0"
fill="none"
stroke="#222"
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
y="5"
text-anchor="middle"
fill="#66d1a1"
font-size="18"
font-family="Arial"
>
A-
</text>

</g>
`
}
