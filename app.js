const container = document.getElementById("scroll")

/* 🔥 LOAD TOP 10 MOBILES */
async function loadMobiles(){

  container.innerHTML = "🔄 Loading deals..."

  try{
    const res = await fetch("mobiles.json")

    if(!res.ok){
      throw new Error("mobiles.json not found")
    }

    const data = await res.json()

    container.innerHTML = ""

    renderMobiles(data)

  }catch(err){
    container.innerHTML = "❌ Failed to load mobiles"
    console.error(err)
  }
}

/* 🔥 RENDER MOBILES */
function renderMobiles(category){

  const section = document.createElement("div")

  let html = `
    <div class="category-title">🔥 Top 10 Trending Phones</div>

    <!-- 🔥 TOP GOOGLE AD -->
    <div class="google-ad">
      <ins class="adsbygoogle"
        style="display:block"
        data-ad-client="ca-pub-2594728028551012"
        data-ad-slot="1234567890"
        data-ad-format="auto"
        data-full-width-responsive="true">
      </ins>
    </div>

    <div class="category-row">
  `

  category.items.slice(0,10).forEach((item,index)=>{

    let badge = ""
    let extraClass = ""

    if(index === 0){
      badge = "🥇#1"
      extraClass = "top1"
    }
    else if(index === 1){
      badge = "🥈#2"
      extraClass = "top2"
    }
    else if(index === 2){
      badge = "🥉#3"
      extraClass = "top3"
    }

    html += `
      <div class="card ${extraClass}">

        ${badge ? `<div class="top-badge">${badge}</div>` : ""}

        <img src="${item.image}"
             onerror="this.src='https://via.placeholder.com/200'">

        <div style="font-weight:bold;margin-top:5px;">
          ${item.name}
        </div>

        <button class="buy-btn"
          onclick="buyNow('${item.name}')">
          🛒 Get Best Deal 🔥
        </button>

      </div>
    `

    /* 🔥 SECOND AD AFTER 5th ITEM */
    if(index === 4){
      html += `
        </div>

        <div class="google-ad">
          <ins class="adsbygoogle"
            style="display:block"
            data-ad-client="ca-pub-2594728028551012"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true">
          </ins>
        </div>

        <div class="category-row">
      `
    }

  })

  html += `</div>`

  section.innerHTML = html
  container.appendChild(section)

  /* 🔥 LOAD ADS AFTER RENDER */
  setTimeout(()=>{
    try{
      (adsbygoogle = window.adsbygoogle || []).push({})
      (adsbygoogle = window.adsbygoogle || []).push({})
    }catch(e){
      console.log("Ads not loaded yet")
    }
  }, 500)
}

/* 🔥 BUY BUTTON (AFFILIATE LINK) */
function buyNow(name){

  const url =
    "https://www.amazon.in/s?k=" +
    encodeURIComponent(name) +
    "&tag=trendingpho05-21"

  window.open(url, "_blank")
}

/* 🔥 START APP */
document.addEventListener("DOMContentLoaded", ()=>{
  loadMobiles()
})