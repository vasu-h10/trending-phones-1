function renderCategory(category){

  const section = document.createElement("div")

  let html = `
    <div class="category-title">🔥 Top 10 Trending Phones</div>

    <!-- 🔥 TOP AD -->
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
      badge = "🥇 #1 BEST DEAL"
      extraClass = "top1"
    }
    else if(index === 1){
      badge = "🥈 #2 HOT PICK"
      extraClass = "top2"
    }
    else if(index === 2){
      badge = "🥉 #3 VALUE"
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

    // 🔥 SECOND AD AFTER 5th ITEM
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

  // 🔥 LOAD ADS
  setTimeout(()=>{
    (adsbygoogle = window.adsbygoogle || []).push({})
    (adsbygoogle = window.adsbygoogle || []).push({})
  }, 500)
}