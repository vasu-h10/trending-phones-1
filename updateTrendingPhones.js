const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

async function fetchPhones(){

try{

const url="https://www.gsmarena.com/results.php3?sQuickSearch=phone"

const res=await axios.get(url,{
headers:{
"User-Agent":"Mozilla/5.0"
}
})

const $=cheerio.load(res.data)

let phones=[]

$(".makers li").each((i,el)=>{

const name=$(el).find("span").text().trim()
let image=$(el).find("img").attr("src")

if(image && image.startsWith("//")){
image="https:"+image
}

if(name && image){

phones.push({
name:name,
image:image
})

}

})

if(phones.length===0){
throw new Error("No phones found")
}

fs.writeFileSync(
"phones.json",
JSON.stringify({phones:phones},null,2)
)

console.log("phones.json updated:",phones.length)

}catch(err){

console.log("Fetch failed:",err.message)

}

}

fetchPhones()
