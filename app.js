let allPhones = []

/* ✅ WAIT FOR FIREBASE */
async function waitFirebase(){
  while(!window.db){
    await new Promise(r=>setTimeout(r,100))
  }
}

/* LOAD PHONES */
async function loadPhones(){

  await waitFirebase()

  const res = await fetch("phones.json")
  const data = await res.json()

  allPhones = (data.phones || []).map((p)=>({
    ...p,
    score: 0
  }))

  await loadTrendingFromDB()
  displayPhones(allPhones.slice(0,40))
}

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* 🔥 IMPROVED MATCH (VERY IMPORTANT FIX) */
function isMatch(phoneName, trendKey){
  phoneName = normalize(phoneName)
  trendKey = normalize(trendKey)

  return phoneName.includes(trendKey)
}

/* DISPLAY */
function displayPhones(list){

  const container = document.getElementById("scroll")
  container.innerHTML = ""

  list.sort((a,b)=>(b.score||0)-(a.score||0))

  list.forEach((phone,index)=>{

    const isTop = index === 0

    const card = document.createElement("div")
    card.className = isTop ? "scroll-card top-card" : "scroll-card"

    card.onclick = ()=>{
      saveTrending(phone.name)
    }

    card.innerHTML = `
      <div class="phone-title">${phone.name}</div>
      <img class="main-img" src="${phone.image}">
    `

    container.appendChild(card)
  })
}

/* SEARCH */
function searchPhones(){

  const keyword=document.getElementById("search").value.trim()
  if(keyword.length<2)return

  let results = allPhones.filter(p=>
    normalize(p.name).includes(normalize(keyword))
  )

  if(results.length){
    saveTrending(keyword)
    displayPhones(results.slice(0,40))
  }
}

/* 🔥 SAVE TO FIREBASE */
async function saveTrending(keyword){

  await waitFirebase()

  const db = window.db
  const key = normalize(keyword)

  const ref = window.collection(db, "trending")
  const snapshot = await window.getDocs(ref)

  let found = null

  snapshot.forEach(docSnap=>{
    if(docSnap.data().key === key){
      found = docSnap
    }
  })

  if(found){
    const docRef = window.doc(db,"trending",found.id)
    await window.updateDoc(docRef,{
      count: window.increment(1)
    })
  }else{
    await window.addDoc(ref,{
      key:key,
      label:keyword,
      count:1
    })
  }

  await loadTrendingFromDB()
  displayPhones(allPhones.slice(0,40))
}

/* 🔥 LOAD TRENDING + FINAL RANKING */
async function loadTrendingFromDB(){

  await waitFirebase()

  const db = window.db

  const ref = window.collection(db, "trending")
  const q = window.query(ref, window.orderBy("count","desc"))

  const snapshot = await window.getDocs(q)

  let trendingList = []

  snapshot.forEach(docSnap=>{
    trendingList.push(docSnap.data())
  })

  // 🔥 RESET SCORES
  allPhones.forEach(phone=>{
    phone.score = 0
  })

  // 🔥 APPLY STRICT RANKING
  trendingList.forEach((trend, index)=>{

    allPhones.forEach(phone=>{

      if(isMatch(phone.name, trend.key)){

        phone.score = (trendingList.length - index) * 1000 + trend.count

      }

    })

  })

  // 🔥 SHOW TRENDING UI
  const box = document.getElementById("trending")
  box.innerHTML=""

  trendingList.slice(0,5).forEach((trend)=>{

    const div = document.createElement("div")
    div.className="trend-phone"
    div.innerText = `${trend.label} 🔥 ${trend.count}`

    div.onclick=()=>{
      document.getElementById("search").value=trend.label
      searchPhones()
    }

    box.appendChild(div)
  })
}

loadPhones()