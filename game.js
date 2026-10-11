let currentLevel = 1;
let score = 0;
let target = 300;
let pendingLevel = 0;
let unlockedLevels = JSON.parse(localStorage.getItem('sfa_levels')) || [1];

const home = document.getElementById('home');
const levelScreen = document.getElementById('levelScreen');
const gameScreen = document.getElementById('gameScreen');

function goHome(){showScreen(home)}
function openLevelGrid(){showScreen(levelScreen); renderGrid();}
function showScreen(s){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active')); s.classList.add('active');}

function renderGrid(){
  const grid = document.getElementById('levelGrid');
  grid.innerHTML='';
  for(let i=1;i<=100;i++){
    let div = document.createElement('div');
    let isUnlocked = unlockedLevels.includes(i);
    let isCompleted = localStorage.getItem('lvl_'+i)=='done';
    div.className='levelBox ' + (isCompleted?'completed': isUnlocked?'unlocked':'locked');
    div.innerText=i;
    div.onclick=()=>handleLevelClick(i);
    grid.appendChild(div);
  }
}

function handleLevelClick(lvl){
  // HAR 5 LEVEL PE REWARDED POPUP
  if(lvl % 5 === 0 &&!unlockedLevels.includes(lvl)){
    pendingLevel = lvl;
    document.getElementById('lockLevel').innerText=lvl;
    document.getElementById('popup').style.display='flex';
    return;
  }
  if(!unlockedLevels.includes(lvl)) return;

  currentLevel = lvl;
  startGame();
}

function startGame(){
  score=0;
  document.getElementById('currLevel').innerText=currentLevel;
  updateScore();
  createBoard();
  showScreen(gameScreen);
}

function createBoard(){
  const board=document.getElementById('board');
  board.innerHTML='';
  for(let i=0;i<9;i++){
    let d=document.createElement('div');
    d.className='tile';
    d.innerText=Math.floor(Math.random()*5)+1;
    d.onclick=()=>tap(d);
    board.appendChild(d);
  }
}
function tap(el){
  score+=parseInt(el.innerText)*5;
  if(score>300) score=300;
  el.innerText=Math.floor(Math.random()*5)+1;
  updateScore();
  if(score>=300) levelComplete();
}
function updateScore(){
  document.getElementById('score').innerText=score;
  document.getElementById('progressBar').style.width=(score/3)+'%';
}

function levelComplete(){
  localStorage.setItem('lvl_'+currentLevel,'done');
  let next = currentLevel+1;
  if(!unlockedLevels.includes(next) && next<=100){
    unlockedLevels.push(next);
    localStorage.setItem('sfa_levels',JSON.stringify(unlockedLevels));
  }

  // HAR 2 LEVEL PE INTERSTITIAL
  if(currentLevel % 2 === 0){
    window.showadsbitvex_init().then(()=>{
      openLevelGrid();
    }).catch(()=>{ openLevelGrid(); });
  }else{
    setTimeout(()=>{ openLevelGrid(); },500);
  }
}

// REWARDED ADS FOR 5th LEVEL
function watchRewarded(){
  window.showadsbitvex().then(()=>{
    unlockedLevels.push(pendingLevel);
    localStorage.setItem('sfa_levels',JSON.stringify(unlockedLevels));
    document.getElementById('popup').style.display='none';
    currentLevel=pendingLevel;
    startGame();
  }).catch(()=>{ alert("Ad fail, try again"); });
}
function closePopup(){document.getElementById('popup').style.display='none';}
