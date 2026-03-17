const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

async function fetchPhones(){

try{

const base = "https://www.gsmarena.com/"
const url = base

const res = await axios.get(url,{
headers:{ "User-Agent":"Mozilla/5.0" }
})

const $ = cheerio.load(res.data)

let phones = []

/* 🔥 Get trending phones links */
$(".module-phones li a").each((i,el)=>{

const link = $(el).attr("href")
const name = $(el).find("span").text().trim()
let image = $(el).find("img").attr("src")

if(image && image.startsWith("//")){
image = "https:" + image
}

if(link && name && image){

phones.push({
name,
image,
link: base + link
})

}

})

/* Limit (important to avoid block) */
phones = phones.slice(0,20)

console.log("Fetching details for", phones.length, "phones...")

let finalPhones = []

/* 🔥 Fetch each phone details */
for(const phone of phones){

try{

const page = await axios.get(phone.link,{
headers:{ "User-Agent":"Mozilla/5.0" }
})

const $$ = cheerio.load(page.data)

/* Extract specs */
let battery = $$("#specs-list").text().match(/(\d{4,6}mAh)/i)?.[0] || "N/A"
let camera = $$("#specs-list").text().match(/(\d{2,3}MP)/i)?.[0] || "N/A"
let display = $$("#specs-list").text().match(/(\d\.\d{1,2}\s?inch)/i)?.[0] || "N/A"

finalPhones.push({
name: phone.name,
image: phone.image,
battery,
camera,
display
})

console.log("✔", phone.name)

}catch(err){
console.log("❌ Failed:", phone.name)
}

}

/* Save JSON */
fs.writeFileSync(
"phones.json",
JSON.stringify({phones: finalPhones}, null, 2)
)

console.log("🔥 DONE! phones.json created:", finalPhones.length)

}catch(err){

console.log("❌ Error:", err.message)

}

}

fetchPhones()