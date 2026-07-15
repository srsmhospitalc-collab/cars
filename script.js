const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw33O3Y3xqtM9L9RoISjEMj15pAF6FT9Y4kcfNMk5ig3LDZt08Rqr2_4SA2hURy-xbQ/exec";

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

// BUTTON 1 CLICK
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

// BUTTON 2 CLICK - REDEEM
document.getElementById("redeemBtn").onclick = () => {
  let twoDays = 2*24*60*60*1000;
  if(Date.now() - lastRedeem < twoDays){
    let left = Math.ceil((twoDays - (Date.now() - lastRedeem))/(24*60*60*1000));
    alert(`${left} din baad dobara redeem kar sakte ho`);
    return;
  }
  
  let link = prompt(`${username}, Insta Reel Link ya UPI ID dalo:`);
  if(link){
    // SHEET ME BHEJO
    fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({link:link, coins:100, username:username})
    }).then(()=>console.log("sent to sheet"));
    
    coins -= 100;
    lastRedeem = Date.now();
    localStorage.setItem("lastRedeem", lastRedeem);
    saveData();
    updateUI();
    alert("Request bhej di gayi ✅ Sheet me check kar");
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
