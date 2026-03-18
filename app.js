let allPhones = []

/* LOAD PHONES */
async function loadPhones(){

  const res = await fetch("phones.json")
  const data = await res.json()

  allPhones = (data.phones || []).map(p=>({
    ...p,
    clicks: 0,
    score: 0
  }))

  displayPhones(allPhones)
}

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* CALCULATE SCORE */
function calculateScore(phone){
  return (phone.clicks || 0) * 10
}

/* DISPLAY */
function displayPhones(list){

  const container = document.getElementById("scroll")
  container.innerHTML = ""

  // 🔥 SORT BY TRENDING
  list.forEach(p=>{
    p.score = calculateScore(p)
  })

  list.sort((a,b)=>b.score - a.score)

  list.forEach((phone,index)=>{

    const isTop = index === 0

    const card = document.createElement("div")
    card.className = isTop ? "scroll-card top-card" : "scroll-card"

    // 🔥 CLICK TRACK
    card.onclick = ()=>{
      phone.clicks++
      displayPhones(allPhones)
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

  displayPhones(results)
}

loadPhones()