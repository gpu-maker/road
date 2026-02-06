let player={
  health:100,
  energy:100,
  thirst:100,
  warmth:50,

  location:"Forest",

  campfire:{active:false,level:0,fuel:0},
  shelter:{level:1},
  armor:{level:1,durability:40,max:40},

  inventory:{
    wood:0,
    metal:0,
    grass:0,
    water:1,
    bandage:0
  }
};

const shelterNames=["","⛺ Tent","🛖 Hut","🏠 Cabin"];
const fireNames=["None","🔥 Campfire","🪨 Ring","🏭 Furnace"];

function updateUI(){
  health.textContent=player.health;
  energy.textContent=player.energy;
  thirst.textContent=player.thirst;
  warmth.textContent=player.warmth;
  location.textContent=player.location;
  fire.textContent=fireNames[player.campfire.level];
  shelter.textContent=shelterNames[player.shelter.level];
  armor.textContent=`L${player.armor.level} (${player.armor.durability}/${player.armor.max})`;

  inventory.innerHTML="";
  for(let i in player.inventory){
    inventory.innerHTML+=`<div>${i}: ${player.inventory[i]}</div>`;
  }
}

function log(m){
  document.getElementById("log").textContent=m;
}

/* 🌍 TRAVEL */
function travel(place){
  if(player.energy<10) return log("Not enough energy.");
  player.energy-=10;
  player.location=place;
  log("You travel to the "+place+".");
  updateUI();
}

/* ⛏ GATHER */
function gather(){
  if(player.energy<5) return log("Too tired.");
  player.energy-=5;
  gainResource(2);
}

function quickGather(){
  if(player.energy<1) return log("Too tired.");
  player.energy-=1;
  gainResource(1);
}

function gainResource(amount){
  if(player.location==="Forest") player.inventory.wood+=amount;
  if(player.location==="Junkyard") player.inventory.metal+=amount;
  if(player.location==="Clearing") player.inventory.grass+=amount;
  if(player.location==="River") player.inventory.water+=amount;
  updateUI();
}

/* 🩹 CRAFT BANDAGE */
function craftBandage(){
  if(player.inventory.grass<2) return log("Need 2 grass.");
  if(player.energy<2) return log("Need 2 energy.");
  player.inventory.grass-=2;
  player.energy-=2;
  player.inventory.bandage++;
  log("You craft a bandage.");
  updateUI();
}

/* 🎒 ITEMS */
function drink(){
  if(player.inventory.water<=0) return log("No water.");
  player.inventory.water--;
  player.thirst=Math.min(100,player.thirst+30);
  log("You drink water.");
  updateUI();
}

function useBandage(){
  if(player.inventory.bandage<=0) return log("No bandages.");
  player.inventory.bandage--;
  player.health=Math.min(100,player.health+20);
  log("You apply a bandage (+20 HP).");
  updateUI();
}

/* ⬆ UPGRADES */
function upgradeShelter(){
  let cost=[
    null,
    {wood:5,grass:2},
    {wood:8,metal:2}
  ][player.shelter.level];

  if(!cost) return log("Shelter already maxed.");
  if(player.energy<15) return log("Need 15 energy.");

  for(let i in cost){
    if(player.inventory[i]<cost[i]) return log("Missing "+i);
  }

  for(let i in cost) player.inventory[i]-=cost[i];
  player.energy-=15;
  player.shelter.level++;
  updateUI();
}

function upgradeArmor(){
  if(player.armor.level>=3) return log("Armor already maxed.");
  if(player.inventory.metal<3) return log("Need 3 metal.");
  player.inventory.metal-=3;
  player.armor.level++;
  player.armor.max+=20;
  player.armor.durability=player.armor.max;
  updateUI();
}

updateUI();
