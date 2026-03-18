let allPhones = []

/* LOAD PHONES (SAFE) */
async function loadPhones(){

  try{

    const res = await fetch("phones.json")
    const data = await res.json()

    allPhones = (data.phones || []).map((p)=>({
      ...p,
      score: 1
    }))

    displayPhones(allPhones.slice(0,40))

  }catch(err){
    console.log("ERROR loading phones:", err)
  }
}

/* NORMALIZE */
function normalize(text){
  return text.toLowerCase().replace(/[^a-z0-9]/g,"")
}

/* DISPLAY */
function displayPhones(list){

  const container = document.getElementById("scroll")
  container.innerHTML = ""

  list.forEach((phone,index)=>{

    const isTop = index === 0

    const card = document.createElement("div")
    card.className = isTop ? "scroll-card top-card" : "scroll-card"

    card.innerHTML = `
      <div class="phone-title">${phone.name}</div>
      <img class="main-img" src="${phone.image}">
    `

    container.appendChild(card)
  })
}

/* SEARCH (BASIC WORKING) */
function searchPhones(){

  const keyword=document.getElementById("search").value.trim()
  if(keyword.length<2)return

  let results = allPhones.filter(p=>
    normalize(p.name).includes(normalize(keyword))
  )

  if(results.length){
    displayPhones(results.slice(0,40))
  }
}

loadPhones()