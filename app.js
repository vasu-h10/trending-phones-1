let allPhones=[]
let trending={}

/* LOAD */

async function loadPhones(){
const res=await fetch("phones.json")
const data=await res.json()
allPhones=data.phones || []
displayPhones(allPhones.slice(0,40))
}

/* NORMALIZE */

function normalize(text){
return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* DISPLAY */

function displayPhones(list){

const container=document.getElementById("scroll")
container.innerHTML=""

list.forEach((phone,index)=>{

const amazon="https://www.amazon.in/s?k="+encodeURIComponent(phone.name)
const flipkart="https://www.flipkart.com/search?q="+encodeURIComponent(phone.name)

const battery=phone.battery||"5000mAh"
const camera=phone.camera||"64MP"
const processor=phone.processor||"Snapdragon"
const display=phone.display||"6.5 inch"

const card=document.createElement("div")
card.className="scroll-card"

let badge=""
if(index===0){
badge=`<div class="gif-bg"></div>
<div class="rank-badge top1">⭐</div>`
}

card.innerHTML=`
${badge}

<div class="phone-title">${phone.name}</div>

<img class="main-img" src="${phone.image}" loading="lazy">

<!-- 🔥 SLIDER -->
<div class="spec-carousel">

<div class="spec-track">

<div class="spec-slide">
<p>📱 ${display}</p>
<p>📷 ${camera}</p>
<p>⚡ ${processor}</p>
<p>🔋 ${battery}</p>
</div>

<div class="spec-slide">
<p>📅 2025</p>
<p>⚖ 180g</p>
<p>📦 128GB</p>
<p>💻 Android</p>
</div>

</div>

<div class="dots">
<span class="dot active"></span>
<span class="dot"></span>
</div>

</div>

<div class="buy-buttons">
<a class="buy amazon" href="${amazon}" target="_blank">Amazon</a>
<a class="buy flipkart" href="${flipkart}" target="_blank">Flipkart</a>
</div>
`

container.appendChild(card)

})

setTimeout(initCarousel,300)
}

/* SWIPE LOGIC */

function initCarousel(){

document.querySelectorAll(".spec-carousel").forEach(carousel=>{

let track=carousel.querySelector(".spec-track")
let dots=carousel.querySelectorAll(".dot")
let index=0
let startX=0

carousel.addEventListener("touchstart",e=>{
startX=e.touches[0].clientX
})

carousel.addEventListener("touchend",e=>{

let endX=e.changedTouches[0].clientX

if(startX-endX>50) index=Math.min(index+1,1)
if(endX-startX>50) index=Math.max(index-1,0)

track.style.transform=`translateX(-${index*100}%)`

dots.forEach(d=>d.classList.remove("active"))
dots[index].classList.add("active")

})

})

}

/* SEARCH + TRENDING SAME */

function localSearch(keyword){
return allPhones.filter(p=>normalize(p.name).includes(normalize(keyword)))
}

function updateTrending(keyword){
if(keyword.length<3)return
const key=normalize(keyword)
trending[key]?trending[key].count++:trending[key]={count:1,label:keyword}
showTrending()
}

function showTrending(){

const box=document.getElementById("trending")
let items=Object.entries(trending).sort((a,b)=>b[1].count-a[1].count).slice(0,5)

box.innerHTML=""

items.forEach(([key,item])=>{
const div=document.createElement("div")
div.className="trend-phone"
div.innerHTML=`${item.label} <span onclick="removeTrend('${key}')">❌</span>`
div.onclick=()=>{document.getElementById("search").value=item.label;searchPhones()}
box.appendChild(div)
})

}

function removeTrend(key){delete trending[key];showTrending()}

function searchPhones(){

const keyword=document.getElementById("search").value.trim()
if(keyword.length<2)return

let results=localSearch(keyword)

if(results.length){
updateTrending(keyword)
displayPhones(results.slice(0,40))
return
}

document.getElementById("scroll").innerHTML=`
<div style="text-align:center;padding:20px">
<p>Phone not found</p>
<button onclick="goHome()">Back</button>
</div>`
}

function goHome(){
document.getElementById("search").value=""
displayPhones(allPhones.slice(0,40))
}

document.addEventListener("DOMContentLoaded",()=>{
document.getElementById("search").addEventListener("keypress",e=>{
if(e.key==="Enter") searchPhones()
})
})

loadPhones()