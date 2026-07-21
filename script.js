const BOT_TOKEN = "8895544903:AAHbD3V0yU-4vdXl8Ih_EadrmnZAgJWlHtQ";
const CHAT_ID = "7732391940";

let tg = window.Telegram.WebApp;
tg.expand();

let coins = parseInt(localStorage.getItem("coins")) || 0;
let username = tg.initDataUnsafe?.user?.first_name || localStorage.getItem("username") || "User";
localStorage.setItem("username", username);

let today = new Date().toDateString();
let playData = JSON.parse(localStorage.getItem("playData")) || {date:today, level:1, qNo:0, lastTime:0};
let lastRedeem = parseInt(localStorage.getItem("lastRedeem")) || 0;

if(playData.date!== today){ playData = {date:today, level:1, qNo:0, lastTime:0}; }

updateUI();
renderLevels();

// CHECK KARE LEVEL ME AD HAI YA NAHI - 3,6,9...
function isAdLevel(lvl){
  return lvl % 3 === 0;
}

function renderLevels(){
  let html = "";
  for(let i=1; i<=30; i++){
    let locked = i > playData.level;
    let isAd = isAdLevel(i);
    let adTag = isAd? "🪙+50 AD" : "Free";

    html += `
    <div class="level-box ${locked?'locked':''} ${isAd?'ad-level':''}">
      ${isAd? '<span class="ad-badge">AD</span>' : ''}
      <h3>Level ${i} ${locked?'🔒':''}</h3>
      <p>Reward: ${adTag}</p>
      <button class="btn btn-play" ${locked?'disabled':''} onclick="playLevel(${i})">
        ${locked?'Locked': 'Play'}
      </button>
    </div>`;
  }
  document.getElementById("levels").innerHTML = html;
}

async function playLevel(lvl){
  if(playData.level > 30){ alert("Aaj ka 30 level complete! Kal 12 baje ke baad aana"); return; }

  let diff = 5000 - (Date.now() - playData.lastTime);
  if(diff > 0){ alert(Math.ceil(diff/1000) + " sec baad try karo"); return; }

  // AGAR AD WALA LEVEL HAI TO AD CHALAO
  if(isAdLevel(lvl)){
    try{
      await show_11310206(); // TERA ADS CODE YAHI LAGEGA
    }catch{
      alert("Ad pura dekho bhai");
      return;
    }
  }
  startQuestions(lvl);
}

function startQuestions(lvl){
  playData.qNo = 0;
  playData.currentLevel = lvl;
  document.getElementById("qModal").style.display = "flex";
  askQuestion();
}

function askQuestion(){
  if(playData.qNo >= 10){
    let earned = 0;
    if(isAdLevel(playData.currentLevel)) earned = 50; // SIRF AD WALE LEVEL ME 50 COIN

    coins += earned;
    playData.level += 1;
    playData.lastTime = Date.now();
    saveData();
    updateUI();
    renderLevels();
    document.getElementById("qModal").style.display = "none";
    alert(`Level Clear! ${earned>0?'+50 Coins mil gaye':''}`);
    return;
  }

  let a = Math.floor(Math.random()*50)+1;
  let b = Math.floor(Math.random()*50)+1;

  document.getElementById("qCount").innerText = `Level ${playData.currentLevel} - Q ${playData.qNo+1}/10`;
  document.getElementById("question").innerText = `${a} + ${b} =?`;

  document.getElementById("submitAns").onclick = () => {
    let ans = parseInt(document.getElementById("answer").value);
    if(ans == a+b){
      playData.qNo++;
      document.getElementById("answer").value = "";
      askQuestion();
    } else {
      alert("Galat jawab! Dubara try karo");
    }
  }
}

// REDEEM LOGIC
document.getElementById("confirmRedeem").onclick = async () => {
  let link = document.getElementById("redeemLink").value;
  let error = document.getElementById("redeemError");
  error.innerText = "";

  if(coins < 1000){
    error.innerText = "1000 coin chahiye redeem ke liye.";
    return;
  }

  let twoDays = 2*24*60*60*1000;
  if(Date.now() - lastRedeem < twoDays){
    let leftHours = Math.ceil((twoDays - (Date.now() - lastRedeem))/(1000*60*60));
    error.innerText = `Ruko! ${leftHours} ghante baad dobara redeem kar sakte ho`;
    return;
  }

  if(link.trim() == ""){
    error.innerText = "only instagram Reel link dalna zaroori hai";
    return;
  }

  let msg = `🔔 NEW REDEEM REQUEST

👤 Username: ${username}
🔗 Link: ${link}
🪙 Coins: 1000
⏰ Time: ${new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})}`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);

  coins -= 1000;
  lastRedeem = Date.now();
  localStorage.setItem("lastRedeem", lastRedeem);
  saveData();
  updateUI();
  document.getElementById("redeemLink").value = "";
  alert("Request bhej di gayi ✅ 2 din baad dobara kar sakte ho");
}

function saveData(){
  localStorage.setItem("coins", coins);
  localStorage.setItem("playData", JSON.stringify(playData));
}

function updateUI(){
  document.getElementById("coins").innerText = coins;
  document.getElementById("username").innerText = username;
  document.getElementById("limitText").innerText = `Today: ${playData.level-1}/30 Levels`;
  document.getElementById("confirmRedeem").disabled = coins < 1000;
}

function showTab(tab){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  if(tab=='game'){
    document.getElementById("gameTab").style.display="block";
    document.getElementById("redeemTab").style.display="none";
    document.querySelectorAll(".tab")[0].classList.add("active")
  } else {
    document.getElementById("gameTab").style.display="none";
    document.getElementById("redeemTab").style.display="block";
    document.querySelectorAll(".tab")[1].classList.add("active")
  }
}
