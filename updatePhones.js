const axios=require("axios")
const cheerio=require("cheerio")
const fs=require("fs")

const headers={headers:{"User-Agent":"Mozilla/5.0"}}

async function scrapePhones(pageUrl){
 const res=await axios.get(pageUrl,headers)
 const $=cheerio.load(res.data)

 let phones=[]

 $(".makers li").each((i,el)=>{
  const name=$(el).find("span").text().trim()
  const image=$(el).find("img").attr("src")

  phones.push({
   name:name,
   camera:"Unknown",
   battery:"Unknown",
   display:"Unknown",
   image:image
  })
 })

 let next=$("a.pages-next").attr("href")

 return {phones,next}
}

async function updatePhones(){

 try{

  const makersUrl="https://www.gsmarena.com/makers.php3"

  const res=await axios.get(makersUrl,headers)
  const $=cheerio.load(res.data)

  let brands=[]

  $(".st-text a").each((i,el)=>{
   const link=$(el).attr("href")
   brands.push("https://www.gsmarena.com/"+link)
  })

  let allPhones=[]

  for(const brandUrl of brands){

   console.log("Brand:",brandUrl)

   let page=brandUrl

   while(page){

    const data=await scrapePhones(page)

    allPhones=[...allPhones,...data.phones]

    if(data.next){
     page="https://www.gsmarena.com/"+data.next
    }else{
     page=null
    }

    await new Promise(r=>setTimeout(r,2000))
   }

  }

  fs.writeFileSync(
   "phones.json",
   JSON.stringify({phones:allPhones},null,2)
  )

  console.log("Total phones collected:",allPhones.length)

 }catch(err){
  console.log("Error:",err.message)
 }

}

updatePhones()
