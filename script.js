const shelterNames=["","⛺ Tent","🛖 Hut","🏠 Cabin"];
const weatherTypes=["Clear","Rain","Cold","Storm"];

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
 location:"Forest",
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

function log(msg){
 document.getElementById("log").textContent=msg;
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

 inventory.innerHTML="";
 for(let i in player.inventory){
  inventory.innerHTML+=`<div>${i}: ${player.inventory[i]}</div>`;
 }

 carStatus.innerHTML=
  player.car.repairs>=player.car.max
  ? "✅ Car fully repaired"
  : `Repair ${player.car.repairs+1}/${player.car.max}<br>
     Cost: ${Object.entries(carRepairCosts[player.car.repairs])
     .map(([k,v])=>`${k}×${v}`).join(", ")}`;

 localStorage.setItem("roadtripSave",JSON.stringify(player));

 if(player.health<=0){
  log("💀 You collapse and die.");
  document.querySelectorAll("button").forEach(b=>b.disabled=true);
 }
}

function advanceTime(){
 player.day=!player.day;
 player.weather=Math.floor(Math.random()*weatherTypes.length);
 if(!player.day){
  player.energy=Math.max(0,player.energy-10);
  player.thirst=Math.max(0,player.thirst-10);
 }
}

function travel(place){
 if(player.energy<10) return log("Not enough energy.");
 player.energy-=10;
 player.location=place;
 advanceTime();
 updateUI();
}

function gather(){
 if(player.energy<5) return log("Too tired.");
 player.energy-=5;
 gain(2);
}

function quickGather(){
 if(player.energy<1) return log("Too tired.");
 player.energy-=1;
 gain(1);
}

function gain(a){
 if(player.location==="Forest") player.inventory.wood+=a;
 if(player.location==="Junkyard") player.inventory.metal+=a;
 if(player.location==="Clearing") player.inventory.grass+=a;
 if(player.location==="River") player.inventory.water+=a;
 updateUI();
}

function craftBandage(){
 if(player.inventory.grass<2||player.energy<2)
  return log("Need grass & energy.");
 player.inventory.grass-=2;
 player.energy-=2;
 player.inventory.bandage++;
 updateUI();
}

function drink(){
 if(player.inventory.water<=0) return log("No water.");
 player.inventory.water--;
 player.thirst=Math.min(100,player.thirst+30);
 updateUI();
}

function useBandage(){
 if(player.inventory.bandage<=0) return log("No bandages.");
 player.inventory.bandage--;
 player.health=Math.min(100,player.health+20);
 updateUI();
}

function sleep(){
 player.energy=Math.min(100,player.energy+40);
 player.thirst=Math.max(0,player.thirst-10);
 advanceTime();
 updateUI();
}

function buildFire(){
 if(player.inventory.wood<3) return log("Need wood.");
 player.inventory.wood-=3;
 player.campfire=true;
 player.warmth+=10;
 updateUI();
}

function upgradeShelter(){
 if(player.shelter.level>=3) return log("Shelter maxed.");
 let cost=[
  null,
  {wood:5,grass:2},
  {wood:8,metal:2}
 ][player.shelter.level];
 for(let i in cost)
  if(player.inventory[i]<cost[i]) return log("Missing "+i);
 for(let i in cost) player.inventory[i]-=cost[i];
 player.energy-=15;
 player.shelter.level++;
 updateUI();
}

function upgradeArmor(){
 if(player.armor.level>=3) return log("Armor maxed.");
 if(player.inventory.metal<3) return log("Need metal.");
 player.inventory.metal-=3;
 player.armor.level++;
 player.armor.max+=20;
 player.armor.durability=player.armor.max;
 updateUI();
}

function repairCar(){
 if(player.car.repairs>=player.car.max)
  return log("Car repaired.");
 let cost=carRepairCosts[player.car.repairs];
 if(player.energy<cost.energy) return log("No energy.");
 for(let i in cost)
  if(i!=="energy" && player.inventory[i]<cost[i])
   return log("Missing "+i);
 for(let i in cost)
  if(i!=="energy") player.inventory[i]-=cost[i];
 player.energy-=cost.energy;
 player.car.repairs++;
 if(player.car.repairs>=player.car.max){
  log("🚗 You repair the car and escape. YOU WIN.");
 }
 updateUI();
}

function saveGame(){
 localStorage.setItem("roadtripSave",JSON.stringify(player));
 log("💾 Game saved.");
}

function loadGame(){
 let d=localStorage.getItem("roadtripSave");
 if(!d) return log("No save found.");
 player=JSON.parse(d);
 updateUI();
 log("📂 Game loaded.");
}

loadGame();
updateUI();
