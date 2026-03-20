const container = document.getElementById("scroll");

/* 🔥 LOAD TOP 10 MOBILES */
async function loadMobiles(){

  container.innerHTML = "🔄 Loading deals...";

  try{
    const res = await fetch("mobiles.json");

    if(!res.ok){
      throw new Error("mobiles.json not found");
    }

    const data = await res.json();

    container.innerHTML = "";

    renderMobiles(data);

  }catch(err){
    container.innerHTML = "❌ Failed to load mobiles";
    console.error(err);
  }
}

/* 🔥 RENDER MOBILES */
function renderMobiles(category){

  const section = document.createElement("div");

  let html = `
    <div class="category-title">Top 10 Trending Phones</div>
    <div class="category-row">
  `;

  category.items.slice(0,10).forEach((item,index)=>{

    let badge = "";
    let extraClass = "";

    if(index === 0){
      badge = "🥇";
      extraClass = "top1";
    }
    else if(index === 1){
      badge = "🥈";
      extraClass = "top2";
    }
    else if(index === 2){
      badge = "🥉";
      extraClass = "top3";
    }

    html += `
      <div class="card ${extraClass}">

        ${badge ? `<div class="top-badge">${badge}</div>` : ""}

        <img src="${item.image}"
             onerror="this.src='https://via.placeholder.com/200'">

        <div class="card-content">
          <h3>${item.name}</h3>

          ${item.desc ? `<p class="desc">${item.desc}</p>` : ""}

          <a href="${item.link}" target="_blank">
            <button class="buy-btn">🛒 Get Best Deal</button>
          </a>
        </div>

      </div>
    `;

  });

  html += `</div>`;

  section.innerHTML = html;
  container.appendChild(section);
}

/* 🔥 START APP */
document.addEventListener("DOMContentLoaded", ()=>{
  loadMobiles();
});