let allPhones = []
let currentPage = 1
const phonesPerPage = 20

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* LOAD PHONES */
async function loadPhones(){

  const container = document.getElementById("scroll")
  container.innerHTML = "Loading phones..."

  try{
    const res = await fetch("phones.json")

    if(!res.ok){
      throw new Error("phones.json not found")
    }

    const data = await res.json()

    // 🔥 LOAD LOCAL CLICKS
    const clickData = JSON.parse(localStorage.getItem("clicks")) || {}

    allPhones = (data.phones || []).map(p=>{
      const key = normalize(p.name)
      return {
        ...p,
        clicks: clickData[key] || 0
      }
    })

  }catch(e){
    console.error(e)

    // 🔥 FALLBACK DATA
    allPhones = [
      { name: "iPhone 13", image: "https://via.placeholder.com/200" },
      { name: "Samsung Galaxy S21", image: "https://via.placeholder.com/200" },
      { name: "OnePlus 11", image: "https://via.placeholder.com/200" }
    ]
  }

  showPage(1)
}

/* SAVE CLICK */
function saveClick(name){

  let data = JSON.parse(localStorage.getItem("clicks")) || {}

  const key = normalize(name)

  data[key] = (data[key] || 0) + 1

  localStorage.setItem("clicks", JSON.stringify(data))
}

/* SHOW PAGE */
function showPage(page){

  currentPage = page

  // 🔥 SORT BY CLICKS (TRENDING)
  allPhones.sort((a,b)=>b.clicks - a.clicks)

  const start = (page - 1) * phonesPerPage
  const end = start + phonesPerPage

  displayPhones(allPhones.slice(start, end))
  renderPagination()
}

/* DISPLAY PHONES */
function displayPhones(list){

  const container = document.getElementById("scroll")
  container.innerHTML = ""

  list.forEach((phone,index)=>{

    const battery = phone.battery || "5000mAh"
    const camera = phone.camera || "64MP"
    const display = phone.display || "6.5 inch AMOLED"
    const processor = phone.processor || "Snapdragon"

    const card = document.createElement("div")
    card.className = index === 0 ? "scroll-card top-card" : "scroll-card"

    // 🔥 TOP BADGE
    let topBadge = ""
    if(index === 0){
      topBadge = `<div class="top-label">🔥 Most Popular</div>`
    }

    card.innerHTML = `
      ${topBadge}

      <div class="phone-title">${phone.name}</div>

      <img class="main-img" src="${phone.image}">

      <div class="spec-carousel">
        <div class="spec-track">

          <div class="spec-slide">
            <p>📱 Display: ${display}</p>
            <p>📷 Camera: ${camera}</p>
            <p>🔋 Battery: ${battery}</p>
          </div>

          <div class="spec-slide">
            <p>⚡ Processor: ${processor}</p>
            <p>📦 Storage: 128GB</p>
            <p>📅 Year: 2025</p>
          </div>

        </div>

        <div class="dots">
          <span class="dot active"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- 🔥 BUY BUTTON -->
      <div class="buy-section">
        <button class="buy-btn"
          onclick='buyNow(${JSON.stringify(phone)})'>
          🛒 Buy Now (Best Deal 🔥)
        </button>
      </div>
    `

    container.appendChild(card)
  })

  setTimeout(initCarousel,300)
}

/* 🔥 BUY AMAZON (WITH FALLBACK) */
function buyNow(phone){

  saveClick(phone.name)

  // ✅ DIRECT LINK (IF AVAILABLE)
  if(phone.buyLink && phone.buyLink !== ""){
    window.open(phone.buyLink, "_blank")
  }

  // 🔥 FALLBACK TO SEARCH
  else{
    const url =
      "https://www.amazon.in/s?k=" +
      encodeURIComponent(phone.name) +
      "&tag=trendingpho05-21"

    window.open(url, "_blank")
  }
}

/* CAROUSEL */
function initCarousel(){

  document.querySelectorAll(".spec-carousel").forEach(carousel=>{

    let track = carousel.querySelector(".spec-track")
    let dots = carousel.querySelectorAll(".dot")

    let index = 0
    let startX = 0

    carousel.addEventListener("touchstart",e=>{
      startX = e.touches[0].clientX
    })

    carousel.addEventListener("touchend",e=>{

      let endX = e.changedTouches[0].clientX

      if(startX - endX > 50) index = Math.min(index + 1, 1)
      if(endX - startX > 50) index = Math.max(index - 1, 0)

      track.style.transform = `translateX(-${index*100}%)`

      dots.forEach(d=>d.classList.remove("active"))
      dots[index].classList.add("active")
    })
  })
}

/* PAGINATION */
function renderPagination(){

  let totalPages = Math.ceil(allPhones.length / phonesPerPage)

  let box = document.getElementById("pagination")

  if(!box){
    box = document.createElement("div")
    box.id = "pagination"
    box.style.textAlign = "center"
    box.style.margin = "20px"
    document.body.appendChild(box)
  }

  box.innerHTML = `
    <button onclick="prevPage()" ${currentPage===1 ? "disabled" : ""}>⬅ Prev</button>
    <span>Page ${currentPage} / ${totalPages}</span>
    <button onclick="nextPage()" ${currentPage===totalPages ? "disabled" : ""}>Next ➡</button>
  `
}

function nextPage(){
  if(currentPage < Math.ceil(allPhones.length / phonesPerPage)){
    showPage(currentPage + 1)
  }
}

function prevPage(){
  if(currentPage > 1){
    showPage(currentPage - 1)
  }
}

/* SEARCH */
function searchPhones(){

  const keyword = document.getElementById("search").value.trim()
  if(keyword.length < 2) return

  let results = allPhones.filter(p =>
    normalize(p.name).includes(normalize(keyword))
  )

  displayPhones(results.slice(0,20))
}

/* START */
document.addEventListener("DOMContentLoaded", ()=>{
  loadPhones()
})