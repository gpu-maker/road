let player = {
  health: 100,
  energy: 100,
  thirst: 100,
  warmth: 50,

  time: "Day",
  weather: "Clear",
  carRepairs: 0,

  campfire: { active:false, fuel:0 },

  armor: { level:1, durability:40, max:40 },
  shelter: { level:1 },

  inventory: {
    wood:0, water:0, grass:0, metal:0, meat:0,
    bandage:0, arrow_stone:0, arrow_metal:0
  },

  equipment: { axe:false, bow:false }
};

const shelterNames = ["","⛺ Tent","🛖 Small Hut","🏠 Cabin"];
const weatherTypes = [
  {name:"Clear",drain:1},
  {name:"Rain",drain:2},
  {name:"Cold",drain:4}
];

function updateUI(){
  health.textContent=player.health;
  energy.textContent=player.energy;
  thirst.textContent=player.thirst;
  warmth.textContent=player.warmth;
  weather.textContent=player.weather;
  time.textContent=player.time;
  repairs.textContent=player.carRepairs;
  armor.textContent=`L${player.armor.level} (${player.armor.durability}/${player.armor.max})`;
  shelter.textContent=shelterNames[player.shelter.level];

  const icon=document.getElementById("shelterIcon");
  icon.className="icon";
  if(player.shelter.level===1)icon.classList.add("tent");
  if(player.shelter.level===2)icon.classList.add("hut");
  if(player.shelter.level===3)icon.classList.add("cabin");

  inventory.innerHTML="";
  for(let i in player.inventory){
    inventory.innerHTML+=`<span>🟦 ${i}: ${player.inventory[i]}</span>`;
  }
}

function log(m){document.getElementById("log").textContent=m;}

function drink(){
  if(player.inventory.water<=0) return log("No water.");
  player.inventory.water--;
  player.thirst=Math.min(100,player.thirst+30);
  updateUI();
}

/* 🔥 CAMPFIRE */
function buildFire(){
  if(player.inventory.wood<2) return log("Not enough wood.");
  player.inventory.wood-=2;
  player.campfire.active=true;
  player.campfire.fuel=100;
  log("You light a campfire.");
  updateUI();
}

/* 💤 SLEEP */
function sleep(){
  if(player.time!=="Night") return log("You can only sleep at night.");

  let heal=5, rest=30, risk=0.35;

  if(player.shelter.level===2){ heal=12; rest=50; risk-=0.15; }
  if(player.shelter.level===3){ heal=20; rest=70; risk-=0.25; }
  if(player.campfire.active) risk-=0.15;

  if(Math.random()<risk){
    applyDamage(15);
    log("Something attacks you in your sleep!");
  } else {
    player.health=Math.min(100,player.health+heal);
    player.energy=Math.min(100,player.energy+rest);
    log("You sleep safely until morning.");
  }

  player.time="Day";
  updateUI();
}

function applyDamage(a){
  if(player.time==="Night"){
    if(player.shelter.level===2)a-=5;
    if(player.shelter.level===3)a-=8;
    if(player.campfire.active)a-=5;
  }
  if(a<0)a=0;

  if(player.armor.durability>0){
    player.armor.durability-=a;
    if(player.armor.durability<0){
      player.health+=player.armor.durability;
      player.armor.durability=0;
    }
  } else player.health-=a;

  checkDeath();
}

function gather(i){
  if(player.energy<5)return log("Too tired.");
  player.energy-=5;
  player.thirst-=3;
  player.warmth-=2;
  player.inventory[i]++;
  dangerCheck();
  updateUI();
}

function dangerCheck(){
  let chance=0.35;
  if(player.campfire.active) chance-=0.15;
  if(player.time==="Night"&&Math.random()<chance)applyDamage(15);
}

function weatherTick(){
  let w=weatherTypes[Math.floor(Math.random()*weatherTypes.length)];
  player.weather=w.name;

  let drain=w.drain;
  if(player.campfire.active) drain-=2;
  if(player.shelter.level===2) drain-=1;
  if(player.shelter.level===3) drain-=2;
  if(drain<0) drain=0;

  player.energy-=drain;
  player.thirst-=drain;
  player.warmth-=drain*2;

  if(player.warmth<=0){
    player.health-=5;
    log("You are freezing.");
  }

  if(player.campfire.active){
    player.campfire.fuel-=10;
    player.warmth=Math.min(100,player.warmth+5);
    if(player.campfire.fuel<=0){
      player.campfire.active=false;
      log("The campfire burns out.");
    }
  }

  checkDeath();
  updateUI();
}

function checkDeath(){
  if(player.health<=0||player.energy<=0||player.thirst<=0){
    alert("☠️ You died in the forest.");
    localStorage.clear();location.reload();
  }
}

function winGame(){
  alert("🚗 You repaired the car and escaped!");
  localStorage.clear();location.reload();
}

function saveGame(){
  localStorage.setItem("roadtripSave",JSON.stringify(player));
}

function loadGame(){
  let d=localStorage.getItem("roadtripSave");
  if(d){player=JSON.parse(d);updateUI();}
}

function cycleTime(){player.time=player.time==="Day"?"Night":"Day";}

setInterval(cycleTime,20000);
setInterval(weatherTick,15000);
updateUI();
