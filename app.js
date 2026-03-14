let allPhones=[]
let trending={}

/* LOAD DATABASE */

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

/* DISPLAY PHONES */

function displayPhones(list){

const container=document.getElementById("scroll")
container.innerHTML=""

list.forEach((phone,index)=>{

const amazon="https://www.amazon.in/s?k="+encodeURIComponent(phone.name)
const flipkart="https://www.flipkart.com/search?q="+encodeURIComponent(phone.name)

const card=document.createElement("div")
card.className="scroll-card"

/* BADGE ONLY FOR TOP CARD */

let badge=""

if(index===0){
badge=`
<div class="gif-bg"></div>
<div class="rank-badge top1">⭐</div>
`
}

/* CARD CONTENT */

card.innerHTML=`
${badge}

<div class="phone-title">${phone.name}</div>

<img class="main-img" src="${phone.image}" loading="lazy">

<div class="buy-buttons">

<a class="buy amazon"
href="${amazon}"
target="_blank"
rel="noopener noreferrer">
Buy on Amazon
</a>

<a class="buy flipkart"
href="${flipkart}"
target="_blank"
rel="noopener noreferrer">
Buy on Flipkart
</a>

</div>
`

container.appendChild(card)

})

}

/* LOCAL SEARCH */

function localSearch(keyword){

return allPhones.filter(phone =>
normalize(phone.name).includes(normalize(keyword))
)

}

/* UPDATE TRENDING */

function updateTrending(keyword){

keyword=keyword.trim()

if(keyword.length<3) return

const key=normalize(keyword)

if(!trending[key]){
trending[key]={count:1,label:keyword}
}else{
trending[key].count++
}

showTrending()

}

/* SHOW TRENDING */

function showTrending(){

const box=document.getElementById("trending")

let items=Object.entries(trending)
.sort((a,b)=>b[1].count-a[1].count)
.slice(0,5)

box.innerHTML=""

items.forEach(([key,item])=>{

const div=document.createElement("div")
div.className="trend-phone"

div.innerHTML=`
<span>${item.label}</span>
<span class="remove-trend" onclick="removeTrend('${key}')">❌</span>
`

div.onclick=(e)=>{

if(e.target.classList.contains("remove-trend")) return

document.getElementById("search").value=item.label
searchPhones()

}

box.appendChild(div)

})

if(items.length>0){

const clear=document.createElement("div")
clear.className="clear-trending"
clear.innerText="Clear All"

clear.onclick=()=>{
trending={}
showTrending()
}

box.appendChild(clear)

}

}

/* REMOVE TREND */

function removeTrend(key){
delete trending[key]
showTrending()
}

/* SEARCH */

function searchPhones(){

const keyword=document.getElementById("search").value.trim()

if(keyword.length<2) return

let results=localSearch(keyword)

if(results.length>0){

updateTrending(keyword)
displayPhones(results.slice(0,40))
return

}

/* GOOGLE FALLBACK */

const container=document.getElementById("scroll")

container.innerHTML=`
<div style="text-align:center;padding:20px">

<p>Phone not found in database</p>

<a href="https://www.google.com/search?q=${encodeURIComponent(keyword+" mobile phone")}" target="_blank">
Search this phone on Google
</a>

<br><br>

<button onclick="goHome()" class="home-btn">
⬅ Back to Home
</button>

</div>
`

}

/* BACK HOME */

function goHome(){

document.getElementById("search").value=""
displayPhones(allPhones.slice(0,40))

}

/* ENTER KEY SEARCH */

document.addEventListener("DOMContentLoaded",()=>{

const input=document.getElementById("search")

input.addEventListener("keypress",function(e){

if(e.key==="Enter"){
searchPhones()
}

})

})

/* START */

loadPhones()
