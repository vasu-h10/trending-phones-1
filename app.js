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

  allPhones = (data.phones || []).map((p,i)=>({
    ...p,
    score: 50 - i
  }))

  displayPhones(allPhones.slice(0,40))
  loadTrendingFromDB()
}

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
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
      phone.score += 10
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

  loadTrendingFromDB()
}

/* 🔥 LOAD TRENDING + APPLY RANKING */
async function loadTrendingFromDB(){

  await waitFirebase()

  const db = window.db

  const ref = window.collection(db, "trending")
  const q = window.query(ref, window.orderBy("count","desc"))

  const snapshot = await window.getDocs(q)

  let trendingMap = {}

  snapshot.forEach(docSnap=>{
    const data = docSnap.data()
    trendingMap[data.key] = data.count
  })

  // 🔥 APPLY TRENDING BOOST
  allPhones.forEach(phone=>{
    const nameKey = normalize(phone.name)

    Object.keys(trendingMap).forEach(key=>{
      if(nameKey.includes(key)){
        phone.score += trendingMap[key] * 30
      }
    })
  })

  // 🔥 RE-RENDER WITH NEW RANKING
  displayPhones(allPhones.slice(0,40))

  // 🔥 SHOW TRENDING UI
  const box = document.getElementById("trending")
  box.innerHTML=""

  Object.entries(trendingMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5)
    .forEach(([key,count])=>{
      const div = document.createElement("div")
      div.className="trend-phone"
      div.innerText = `${key} 🔥 ${count}`

      div.onclick=()=>{
        document.getElementById("search").value=key
        searchPhones()
      }

      box.appendChild(div)
    })
}

loadPhones()