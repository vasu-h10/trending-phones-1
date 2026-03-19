const container = document.getElementById("scroll")

/* 🔥 LOAD ALL CATEGORIES */
async function loadCategories(){

  container.innerHTML = "Loading..."

  try{
    const res = await fetch("categories.json")

    if(!res.ok){
      throw new Error("categories.json not found")
    }

    const data = await res.json()

    container.innerHTML = ""

    // 🔥 LOOP ALL CATEGORIES
    for(const cat of data.categories){

      try{
        const catRes = await fetch(cat.file)

        if(!catRes.ok) continue

        const catData = await catRes.json()

        renderCategory(catData)

      }catch(e){
        console.log("Skip category:", cat.file)
      }
    }

  }catch(err){
    container.innerHTML = "❌ Failed to load categories"
    console.error(err)
  }
}

/* 🔥 RENDER CATEGORY */
function renderCategory(category){

  const section = document.createElement("div")

  section.innerHTML = `
    <!-- 🔥 CATEGORY AD BANNER -->
    <div class="category-banner">
      <img src="https://source.unsplash.com/800x300/?${category.category}"
           onerror="this.src='https://via.placeholder.com/800x200'">
    </div>

    <!-- 🔥 TITLE -->
    <div class="category-title">🔥 ${category.category}</div>

    <!-- 🔥 PRODUCTS ROW -->
    <div class="category-row">

      ${category.items.slice(0,5).map((item,index)=>`

        <div class="card">

          <img src="${item.image}"
               onerror="this.src='https://via.placeholder.com/200'">

          <div>${item.name}</div>

          <button class="buy-btn"
            onclick="buyNow('${item.name}')">
            🛒 Buy
          </button>

        </div>

      `).join("")}

    </div>
  `

  container.appendChild(section)
}

/* 🔥 BUY FUNCTION (AFFILIATE LINK) */
function buyNow(name){

  const url =
    "https://www.amazon.in/s?k=" +
    encodeURIComponent(name) +
    "&tag=trendingpho05-21"

  window.open(url, "_blank")
}

/* 🔥 START APP */
document.addEventListener("DOMContentLoaded", ()=>{
  loadCategories()
})