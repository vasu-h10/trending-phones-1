let allPhones = []
let currentPage = 1
const phonesPerPage = 20

/* 🔧 WAIT FIREBASE */
async function waitFirebase(){
  while(!window.db){
    await new Promise(r=>setTimeout(r,100))
  }
}

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* DOC ID */
function docId(name){
  return normalize(name).replace(/\s+/g,"_")
}

/* SCORE */
function calculateScore(p){
  const clicks = p.clicks || 0
  const rating = p.reviews ? (p.ratingTotal / p.reviews) : 0
  return (clicks * 3) + (rating * 50)
}

/* LOAD */
async function loadPhones(){

  const res = await fetch("phones.json")
  const data = await res.json()

  allPhones = (data.phones || []).map(p=>({
    ...p,
    clicks: 0,
    ratingTotal: 0,
    reviews: 0,
    score: 0
  }))

  // 🔥 LOAD FIREBASE DATA
  try{
    await waitFirebase()
    const snap = await window.getDocs(window.collection(window.db,"phones"))

    snap.forEach(docSnap=>{
      const d = docSnap.data()

      allPhones.forEach(p=>{
        if(normalize(p.name).includes(d.name)){
          p.clicks = d.clicks || 0
          p.ratingTotal = d.ratingTotal || 0
          p.reviews = d.reviews || 0
        }
      })
    })
  }catch(e){
    console.log("firebase load skipped", e)
  }

  showPage(1)
}

/* SHOW PAGE */
function showPage(page){

  currentPage = page

  allPhones.forEach(p=>{
    p.score = calculateScore(p)
  })

  allPhones.sort((a,b)=>b.score - a.score)

  const start = (page - 1) * phonesPerPage
  const end = start + phonesPerPage

  const pageData = allPhones.slice(start, end)

  displayPhones(pageData)
  renderPagination()
}

/* SAVE CLICK */
async function saveClick(name){
  try{
    await waitFirebase()
    const id = docId(name)
    const ref = window.doc(window.db,"phones",id)

    await window.updateDoc(ref,{
      clicks: window.increment(1)
    })
  }catch{
    await window.addDoc(window.collection(window.db,"phones"),{
      name: normalize(name),
      clicks: 1,
      ratingTotal: 0,
      reviews: 0
    })
  }
}

/* SAVE RATING */
async function saveRating(name,value){
  try{
    await waitFirebase()
    const id = docId(name)
    const ref = window.doc(window.db,"phones",id)

    await window.updateDoc(ref,{
      ratingTotal: window.increment(value),
      reviews: window.increment(1)
    })
  }catch{
    await window.addDoc(window.collection(window.db,"phones"),{
      name: normalize(name),
      clicks: 0,
      ratingTotal: value,
      reviews: 1
    })
  }
}

/* DISPLAY */
function displayPhones(list){

  const container = document.getElementById("scroll")
  container.innerHTML = ""

  list.forEach((phone,index)=>{

    const battery = phone.battery || "5000mAh"
    const camera = phone.camera || "64MP"
    const display = phone.display || "6.5 inch AMOLED"
    const processor = phone.processor || "Snapdragon"

    const avgRating = phone.reviews
      ? (phone.ratingTotal / phone.reviews).toFixed(1)
      : "0.0"

    const card = document.createElement("div")
    card.className = "scroll-card"

    card.onclick = ()=>{
      phone.clicks++
      saveClick(phone.name)
      showPage(currentPage)
    }

    card.innerHTML = `
      <div class="phone-title">${phone.name}</div>

      <img class="main-img" src="${phone.image}">

      <!-- ⭐ RATING -->
      <div class="rating-box">
        <div class="stars">
          <span onclick="rate('${phone.name}',1)">⭐</span>
          <span onclick="rate('${phone.name}',2)">⭐</span>
          <span onclick="rate('${phone.name}',3)">⭐</span>
          <span onclick="rate('${phone.name}',4)">⭐</span>
          <span onclick="rate('${phone.name}',5)">⭐</span>
        </div>
        <div class="rating-text">Rating: ${avgRating}</div>
      </div>

      <!-- 🔥 CAROUSEL -->
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
    `

    container.appendChild(card)
  })

  setTimeout(initCarousel,300)
}

/* RATE HANDLER */
function rate(name,value){
  saveRating(name,value)
  alert("⭐ Thanks for rating!")
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
    <span style="margin:0 10px;">Page ${currentPage} / ${totalPages}</span>
    <button onclick="nextPage()" ${currentPage===totalPages ? "disabled" : ""}>Next ➡</button>
  `
}

function nextPage(){
  let totalPages = Math.ceil(allPhones.length / phonesPerPage)
  if(currentPage < totalPages){
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

  const keyword=document.getElementById("search").value.trim()
  if(keyword.length<2)return

  let results = allPhones.filter(p=>
    normalize(p.name).includes(normalize(keyword))
  )

  displayPhones(results.slice(0,20))
}

loadPhones()