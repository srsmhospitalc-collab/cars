const BOT_TOKEN = "8895544903:AAHbD3V0yU-4vdXl8Ih_EadrmnZAgJWlHtQ"; // tera token
const CHAT_ID = "7732391940"; // tera chat id

let coins = parseInt(localStorage.getItem("coins")) || 0;
let username = localStorage.getItem("username");
let today = new Date().toDateString();
let playData = JSON.parse(localStorage.getItem("playData")) || {date:today, count:0, lastTime:0};
let lastRedeem = parseInt(localStorage.getItem("lastRedeem")) || 0;

// Pehli baar naam maangega
if(!username){
  username = prompt("Apna naam ya Username dalo:");
  if(username) localStorage.setItem("username", username);
}

if(playData.date !== today){ playData = {date:today, count:0, lastTime:0}; }

updateUI();

// BUTTON 1 CLICK - AD + QUESTIONS
document.getElementById("playBtn").onclick = async () => {
  if(playData.count >= 10){ alert("Aaj ka limit 10/10 complete! Kal 12 baje ke baad aana"); return; }
  
  let diff = 300000 - (Date.now() - playData.lastTime);
  if(diff > 0){ 
    alert(Math.ceil(diff/60000) + " min baad try karo"); 
    return; 
  }

  document.getElementById("playBtn").disabled = true;
  try{
    await show_11310206(); // AD CHALA
    startQuestions(); // QUESTION START
  }catch{
    alert("Ad pura dekho bhai");
    document.getElementById("playBtn").disabled = false;
  }
}

// 3 QUESTION SYSTEM
let qNo = 0;
function startQuestions(){
  qNo = 0;
  askQuestion();
}

function askQuestion(){
  if(qNo >= 3){
    coins += 5;
    playData.count += 1;
    playData.lastTime = Date.now();
    saveData();
    updateUI();
    alert("Shabash! +5 Coins mil gaye");
    document.getElementById("playBtn").disabled = false;
    return;
  }
  
  let a = Math.floor(Math.random()*20)+1;
  let b = Math.floor(Math.random()*20)+1;
  
  document.getElementById("qModal").style.display = "flex";
  document.getElementById("qCount").innerText = `Question ${qNo+1}/3`;
  document.getElementById("question").innerText = `${a} + ${b} = ?`;
  
  document.getElementById("submitAns").onclick = () => {
    document.getElementById("qModal").style.display = "none";
    document.getElementById("answer").value = "";
    qNo++;
    askQuestion();
  }
}

// BUTTON 2 CLICK - REDEEM MODAL KHOLEGA
document.getElementById("redeemBtn").onclick = () => {
  openRedeemModal();
}

// REDEEM MODAL FUNCTION - TELEGRAM WALA
function openRedeemModal(){
  let modal = document.createElement("div");
  modal.id = "redeemModal";
  modal.className = "modal";
  modal.style.display = "flex";
  
  modal.innerHTML = `
    <div class="modal-box">
      <h2>🎁 Redeem Coins</h2>
      <p>Balance: <b>${coins}</b> Coins</p>
      <input type="text" id="redeemLink" placeholder="Insta Reel Link ya UPI ID dalo" style="width:100%; padding:12px; margin:15px 0; border-radius:8px; border:2px solid #333; background:#111; color:#fff">
      <button id="confirmRedeem" class="btn btn-danger">Submit Request</button>
      <button id="closeRedeem" class="btn" style="background:#444">Cancel</button>
      <p id="redeemError" style="color:#ff416c; margin-top:10px"></p>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("closeRedeem").onclick = () => modal.remove();
  
  document.getElementById("confirmRedeem").onclick = async () => {
    let link = document.getElementById("redeemLink").value;
    let error = document.getElementById("redeemError");
    
    // CHECK 1: 100 COIN HAI KYA?
    if(coins < 100){
      error.innerText = "Tere paas 100 coin nahi hai. Pehle earn kar.";
      return;
    }
    
    // CHECK 2: 2 DIN HO GAYE KYA?
    let twoDays = 2*24*60*60*1000;
    if(Date.now() - lastRedeem < twoDays){
      let left = Math.ceil((twoDays - (Date.now() - lastRedeem))/(24*60*60*1000));
      error.innerText = `Ruko! ${left} din baad dobara redeem kar sakte ho`;
      return;
    }
    
    if(link.trim() == ""){
      error.innerText = "Link ya UPI ID dalna zaroori hai";
      return;
    }

    // SAB THEEK HAI - TELEGRAM PE BHEJO
    let msg = `🔔 NEW REDEEM REQUEST

👤 Username: ${username}
🔗 Link: ${link}
🪙 Coins: 100
⏰ Time: ${new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"})}`;

    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(msg)}`);
    } catch(e) {
      console.log("Telegram error", e)
    }

    coins -= 100;
    lastRedeem = Date.now();
    localStorage.setItem("lastRedeem", lastRedeem);
    saveData();
    updateUI();
    modal.remove();
    alert("Request bhej di gayi ✅ 2 din baad dobara kar sakte ho");
  }
}

function saveData(){
  localStorage.setItem("coins", coins);
  localStorage.setItem("playData", JSON.stringify(playData));
}

function updateUI(){
  document.getElementById("coins").innerText = coins;
  document.getElementById("redeemBtn").disabled = coins < 100;
  document.getElementById("limitText").innerText = `Today: ${playData.count}/10`;
  
  let diff = 300000 - (Date.now() - playData.lastTime);
  if(diff > 0 && playData.count < 10){
    document.getElementById("timer").innerText = `Next in: ${Math.ceil(diff/60000)} min`;
    document.getElementById("playBtn").disabled = true;
    setTimeout(updateUI, 1000);
  } else {
    document.getElementById("timer").innerText = "";
    if(playData.count < 10) document.getElementById("playBtn").disabled = false;
  }
}
