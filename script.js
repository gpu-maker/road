const SAVE = "roadtrip_map_weather_save";

/* ========= GAME STATE ========= */
let state = {
  health: 100,
  energy: 100,
  day: 1,
  isDay: true,
  tick: 0,

  weather: "Clear",

  inventory: {
    wood: 0,
    grass: 0,
    metal: 0,
    stoneArrow: 0,
    metalArrow: 0
  },

  weapons: {
    axe: { dur: 100, lvl: 1 },
    bow: { lvl: 1 }
  },

  armor: { dur: 100, lvl: 1 },

  shelter: 0,
  threat: 0,

  mapSize: 5,
  player: { x: 2, y: 2 },
  explored: {}
};

const shelters = ["None", "Camp", "Shack", "Cabin"];
const defense = [0, 5, 10, 20];
const weatherTypes = ["Clear", "Rain", "Fog", "Storm"];

/* ========= SAVE ========= */
function saveGame() {
  localStorage.setItem(SAVE, JSON.stringify(state));
}

function loadGame() {
  const d = localStorage.getItem(SAVE);
  if (d) state = JSON.parse(d);
}

/* ========= UI ========= */
function update() {
  health.textContent = state.health;
  energy.textContent = Math.floor(state.energy);
  cycle.textContent = state.isDay ? `☀️ Day ${state.day}` : `🌙 Night ${state.day}`;
  weather.textContent = `🌦️ Weather: ${state.weather}`;

  inventory.innerHTML = "";
  for (let i in state.inventory)
    inventory.innerHTML += `<div class="item">${i}: ${state.inventory[i]}</div>`;

  shelter.innerHTML = `<div class="item">${shelters[state.shelter]}<br>Defense ${defense[state.shelter]}</div>`;
  drawMinimap();
}

/* ========= MINIMAP ========= */
function drawMinimap() {
  minimap.innerHTML = "";
  for (let y = 0; y < state.mapSize; y++) {
    for (let x = 0; x < state.mapSize; x++) {
      const key = `${x},${y}`;
      let cls = "mapPixel";
      if (state.explored[key]) cls += " explored";
      if (state.player.x === x && state.player.y === y) cls += " player";
      minimap.innerHTML += `<div class="${cls}"></div>`;
    }
  }
}

/* ========= MAP MOVE ========= */
function move(dx, dy) {
  if (state.energy < 5) return;
  const nx = state.player.x + dx;
  const ny = state.player.y + dy;
  if (nx < 0 || ny < 0 || nx >= state.mapSize || ny >= state.mapSize) return;

  state.energy -= state.weather === "Rain" ? 7 : 5;
  state.player = { x: nx, y: ny };
  state.explored[`${nx},${ny}`] = true;
  state.threat += 5;
  log("You move deeper into the forest.");
  update();
}

/* ========= COMBAT ========= */
function melee() {
  if (state.energy < 8) return;
  state.energy -= 8;
  state.threat -= 20;
  state.weapons.axe.dur -= 5;
  log("You fight back with your axe.");
}

function shoot(type) {
  const key = type + "Arrow";
  if (state.inventory[key] <= 0) return;
  state.inventory[key]--;
  let dmg = type === "metal" ? 25 : 12;
  if (state.weather === "Fog") dmg -= 5;
  state.threat -= dmg;
  log(`You fire a ${type} arrow.`);
}

/* ========= WEATHER ========= */
function rollWeather() {
  state.weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
}

/* ========= NIGHT ========= */
function nightAttack() {
  let dmg = Math.max(0, state.threat - defense[state.shelter]);
  if (state.weather === "Storm") dmg += 5;

  if (state.armor.dur > 0) state.armor.dur -= dmg;
  else state.health -= dmg;

  log("Something attacks in the dark...");
}

/* ========= LOOP ========= */
setInterval(() => {
  state.tick++;

  if (state.tick >= 5) {
    state.tick = 0;
    state.isDay = !state.isDay;

    if (state.isDay) {
      state.day++;
      state.threat = 0;
      rollWeather();
      log("Morning breaks.");
    } else {
      log("Night falls...");
    }
  }

  if (state.isDay) state.energy = Math.min(100, state.energy + 2);
  else nightAttack();

  update();
  saveGame();
}, 4000);

/* ========= LOG ========= */
function log(t) {
  logDiv.innerHTML += t + "<br>";
  logDiv.scrollTop = logDiv.scrollHeight;
}

loadGame();
update();
