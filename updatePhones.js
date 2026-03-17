const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

const headers = {
  headers: { "User-Agent": "Mozilla/5.0" }
}

/* 🔥 GET REAL SPECS FROM PHONE PAGE */

async function getSpecs(url){
  try{

    const res = await axios.get(url, headers)
    const $ = cheerio.load(res.data)

    let specs = {
      battery: "Unknown",
      camera: "Unknown",
      processor: "Unknown",
      display: "Unknown"
    }

    $(".specs-table tr").each((i, el)=>{

      const key = $(el).find("td.ttl").text().trim().toLowerCase()
      const val = $(el).find("td.nfo").text().trim()

      if(key.includes("battery")){
        specs.battery = val
      }

      if(key.includes("camera")){
        specs.camera = val
      }

      if(key.includes("chipset")){
        specs.processor = val
      }

      if(key.includes("display")){
        specs.display = val
      }

    })

    return specs

  }catch(err){
    console.log("❌ Specs error:", url)
    return {
      battery: "Unknown",
      camera: "Unknown",
      processor: "Unknown",
      display: "Unknown"
    }
  }
}


/* 🔥 SCRAPE PHONE LIST */

async function scrapePhones(pageUrl){

  const res = await axios.get(pageUrl, headers)
  const $ = cheerio.load(res.data)

  let phones = []

  const items = $(".makers li")

  for(let i = 0; i < items.length; i++){

    const el = items[i]

    const name = $(el).find("span").text().trim()
    const imgSrc = $(el).find("img").attr("src")
    const image = "https://www.gsmarena.com/" + imgSrc

    const link = $(el).find("a").attr("href")
    const phoneUrl = "https://www.gsmarena.com/" + link

    console.log("📱 Scraping:", name)

    /* 🔥 GET REAL SPECS */
    const specs = await getSpecs(phoneUrl)

    phones.push({
      name: name,
      image: image,
      battery: specs.battery,
      camera: specs.camera,
      processor: specs.processor,
      display: specs.display
    })

    /* ⚠️ DELAY PER PHONE (avoid blocking) */
    await new Promise(r => setTimeout(r, 1200))
  }

  let next = $("a.pages-next").attr("href")

  return { phones, next }
}


/* 🔥 MAIN FUNCTION */

async function updatePhones(){

  try{

    const makersUrl = "https://www.gsmarena.com/makers.php3"

    const res = await axios.get(makersUrl, headers)
    const $ = cheerio.load(res.data)

    let brands = []

    $(".st-text a").each((i, el)=>{
      const link = $(el).attr("href")
      brands.push("https://www.gsmarena.com/" + link)
    })

    /* ⚡ TEST MODE (remove later) */
    // brands = brands.slice(0, 2)

    let allPhones = []

    for(const brandUrl of brands){

      console.log("🏷 Brand:", brandUrl)

      let page = brandUrl

      while(page){

        const data = await scrapePhones(page)

        allPhones = [...allPhones, ...data.phones]

        if(data.next){
          page = "https://www.gsmarena.com/" + data.next
        }else{
          page = null
        }

        /* ⚠️ DELAY PER PAGE */
        await new Promise(r => setTimeout(r, 2000))
      }

    }

    fs.writeFileSync(
      "phones.json",
      JSON.stringify({ phones: allPhones }, null, 2)
    )

    console.log("✅ Total phones collected:", allPhones.length)

  }catch(err){
    console.log("❌ Error:", err.message)
  }

}

updatePhones()