const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")

/* ✅ FIXED HEADERS */
const headers = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/"
  }
}

/* 🔥 GET REAL SPECS FROM PHONE PAGE */

async function getSpecs(url){
  try{

    const res = await axios.get(url, {
      ...headers,
      timeout: 10000
    })

    const $ = cheerio.load(res.data)

    let specs = {
      battery: "Unknown",
      camera: "Unknown",
      processor: "Unknown",
      display: "Unknown"
    }

    /* ✅ CORRECT GSMARENA STRUCTURE */
    $(".specs-table").each((i, table)=>{

      $(table).find("tr").each((j, row)=>{

        const label = $(row).find("td.ttl").text().trim().toLowerCase()
        const value = $(row).find("td.nfo").text().trim()

        if(!label || !value) return

        // 🔋 BATTERY
        if(label.includes("battery")){
          specs.battery = value
        }

        // 📷 CAMERA
        if(label.includes("main camera") || label.includes("camera")){
          specs.camera = value
        }

        // ⚡ PROCESSOR
        if(label.includes("chipset")){
          specs.processor = value
        }

        // 📱 DISPLAY
        if(label.includes("display") || label.includes("size")){
          specs.display = value
        }

      })

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

    const image = imgSrc?.startsWith("http")
      ? imgSrc
      : "https://www.gsmarena.com/" + imgSrc

    const link = $(el).find("a").attr("href")
    const phoneUrl = "https://www.gsmarena.com/" + link

    console.log("📱 Scraping:", name)

    const specs = await getSpecs(phoneUrl)

    phones.push({
      name,
      image,
      battery: specs.battery,
      camera: specs.camera,
      processor: specs.processor,
      display: specs.display
    })

    /* ⚠️ SAFE DELAY */
    await new Promise(r => setTimeout(r, 800))
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

    /* ⚡ FIRST RUN TEST (RECOMMENDED) */
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

        await new Promise(r => setTimeout(r, 1200))
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