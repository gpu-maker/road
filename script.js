const shelterNames=["","⛺ Tent","🛖 Hut","🏠 Cabin"];
const weatherTypes=["Clear","Rain","Cold","Storm"];
const ATTACK_CHANCE=0.25;

const carRepairCosts=[
 {metal:2,wood:2,energy:10},
 {metal:3,wood:3,energy:15},
 {metal:4,energy:20},
 {metal:5,energy:25},
 {metal:6,energy:30}
];

let player={
 health:100,
 energy:100,
 thirst:100,
 warmth:50,
 location:"Shelter",
 day:true,
 weather:0,

 shelter:{level:1},
 armor:{level:1,durability:40,max:40},
 campfire:false,

 car:{repairs:0,max:5},

 inventory:{
  wood:0,
  metal:0,
  grass:0,
  water:1,
  bandage:0
 }
};

function log(m){ document.getElementById("log").textContent=m; }

function requireShelter(action){
 if(player.location!=="Shelter"){
  log(`🏕 You must be at the shelter to ${action}.`);
  return false;
 }
 return true;
}

function updateUI(){
 health.textContent=player.health;
 energy.textContent=player.energy;
 thirst.textContent=player.thirst;
 warmth.textContent=player.warmth;
 location.textContent=player.location;
 weather.textContent=weatherTypes[player.weather];
 time.textContent=player.day?"Day":"Night";
 fire.textContent=player.campfire?"🔥 Campfire":"None";
 shelter.textContent=shelterNames[player.shelter.level];
 armor.textContent=`L${player.armor.level} (${player.armor.durability}/${player.armor.max})`;

 healthBar.style.width=`${player.health}%`;
 energyBar.style.width=`${player.energy}%`;
 thirstBar.style.width=`${player.thirst}%`;

 inventory.innerHTML="";
 for(let i in player.inventory)
  inventory.innerHTML+=`<div>${i}: ${player.inventory[i]}</div>`;

 carStatus.innerHTML=
  player.car.repairs>=player.car.max
  ? "✅ Car fully repaired"
  : `Repair ${player.car.repairs+1}/${player.car.max}`;

 if(player.health<=0){
  log("💀 You collapse and die.");
  document.querySelectorAll("button").forEach(b=>b.disabled=true);
 }

 localStorage.setItem("roadtripSave",JSON.stringify(player));
}

function advanceTime(){
 player.day=!player.day;
 player.weather=Math.floor(Math.random()*weatherTypes.length);
 if(!player.day){
  player.energy=Math.max(0,player.energy-10);
  player.thirst=Math.max(0,player.thirst-10);
 }
}

function applySurvivalDamage(){
 if(player.thirst<=0) player.health-=3;
 else if(player.thirst<=30) player.health-=1;
 if(player.energy<=0) player.health-=2;
}

function checkAttack(){
 if(player.location==="Shelter") return;
 if(Math.random()>ATTACK_CHANCE) return;

 let dodge=player.armor.level*0.05;
 if(Math.random()<dodge){
  log("💨 You dodge the attack!");
  return;
 }

 let dmg=Math.floor(Math.random()*6)+5;
 if(player.armor.durability>0){
  player.armor.durability--;
  dmg=Math.max(1,dmg-player.armor.level*2);
 }
 player.health-=dmg;
 log(`👹 Attacked (-${dmg} HP)`);
}

function travel(p){
 if(player.energy<10) return log("Not enough energy.");
 player.energy-=10;
 player.location=p;
 advanceTime();
 applySurvivalDamage();
 updateUI();
}

function gather(){
 if(player.energy<5||player.location==="Shelter") return;
 player.energy-=5;
 gain(2);
 checkAttack();
 applySurvivalDamage();
 updateUI();
}

function quickGather(){
 if(player.energy<1||player.location==="Shelter") return;
 player.energy-=1;
 gain(1);
 checkAttack();
 applySurvivalDamage();
 updateUI();
}

function gain(a){
 if(player.location==="Forest") player.inventory.wood+=a;
 if(player.location==="Junkyard") player.inventory.metal+=a;
 if(player.location==="Clearing") player.inventory.grass+=a;
 if(player.location==="River") player.inventory.water+=a;
}

function craftBandage(){
 if(player.inventory.grass<2||player.energy<2) return;
 player.inventory.grass-=2;
 player.energy-=2;
 player.inventory.bandage++;
 updateUI();
}

function drink(){
 if(player.inventory.water<=0) return;
 player.inventory.water--;
 player.thirst=Math.min(100,player.thirst+30);
 updateUI();
}

function useBandage(){
 if(player.inventory.bandage<=0) return;
 player.inventory.bandage--;
 player.health=Math.min(100,player.health+20);
 updateUI();
}

function sleep(){
 if(player.location==="Shelter"){
  player.energy=Math.min(100,player.energy+60);
  player.health=Math.min(100,player.health+10);
 }else{
  player.energy=Math.min(100,player.energy+40);
 }
 player.thirst=Math.max(0,player.thirst-10);
 advanceTime();
 applySurvivalDamage();
 updateUI();
}

function buildFire(){
 if(!requireShelter("build a campfire")) return;
 if(player.inventory.wood<3) return;
 player.inventory.wood-=3;
 player.campfire=true;
 player.warmth+=10;
 updateUI();
}

function upgradeShelter(){
 if(!requireShelter("upgrade shelter")) return;
 if(player.shelter.level>=3) return;
 player.shelter.level++;
 player.energy-=15;
 updateUI();
}

function upgradeArmor(){
 if(!requireShelter("upgrade armor")) return;
 if(player.inventory.metal<3) return;
 player.inventory.metal-=3;
 player.armor.level++;
 player.armor.max+=20;
 player.armor.durability=player.armor.max;
 updateUI();
}

function repairArmor(){
 if(!requireShelter("repair armor")) return;
 if(player.inventory.metal<1) return;
 player.inventory.metal--;
 player.armor.durability=Math.min(player.armor.max,player.armor.durability+15);
 updateUI();
}

function repairCar(){
 if(!requireShelter("repair the car")) return;
 if(player.car.repairs>=player.car.max) return;
 player.car.repairs++;
 updateUI();
}

function saveGame(){ log("💾 Saved."); }
function loadGame(){
 let d=localStorage.getItem("roadtripSave");
 if(d){ player=JSON.parse(d); }
 updateUI();
}

loadGame();
updateUI();
