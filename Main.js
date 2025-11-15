// idk
const firedSfx = new Audio("shot.mp3");
const missedSfx = new Audio("click.mp3");

// const typa shit

const Secrets1 = document.getElementById("Secrets1");
const buttons = document.querySelectorAll(".buttons");
const gaem = document.getElementById("gaem");
const canvas = document.getElementById("gameCanvas");
const multiplayer = document.getElementById("multiplayerContainer");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

const center = { x: 400, y: 300 };
let scaleX = 1;
let scaleY = 1;
let rectL = 0;
let rectT = 0;

const chamber = {
  chamberContent: ["empty", "live", "empty", "empty", "empty", "empty"], // initial content
  size: 110,
  colour: "gray",
  currentPosition: 0,
  isSpinning: false,
  slots: 6, // number of chambers (collerrr)
  innerRadius: 60, // radius where lives are drawn
  markerSize: 14, // visual marker size
  holes: null,
  chamberStatus: "idle",
  x: canvas.width / 2,
  y: canvas.height / 2,
};

//another object

const lives = {
  size: 20,
  tip: 8,
  tiptip: 5,
  colour: "#f7e840",
  outline: "#bdb12d",
  insideColour: "#481313ff",
  insideOutline: "#191704ff",
  tiptipOutline: "black",
  tiptipColour: "#9d918fff",
  x: 40,
  y: canvas.height / 2 - (chamber.slots / 2) * 40,
};

// message object? (is message even an object?)

const messages = {
  queue: [],
  active: null,
  state: "idle",
  timer: 0,
  powerpoint: 4,
  wait: 420,
  target: canvas.height - 30,
  x: canvas.width / 2,
  y: canvas.height + 20,
};

//square... for what? idk.

const square = {
  size: 30,
  strokeColour: "black",
  colour: "#ce2b2bff",
  x: canvas.width - 60,
  y: canvas.height / 2,
};

// --- Initialization & Game State ---

chamber.chamberContent = new Array(chamber.slots).fill("empty");
chamber.holes = new Array(chamber.slots).fill(true); // Chamber holes/marks

let count = 0;
let counti = 0;
let score = 0;
let isDragging = false;
let isDragObj = false;
let isDraglive = false;
let draBdex = -1;
let bdx = 0;
let bdy = 0;
let rotationAngle = 0;
let lastAngle = 0;
let rotationVelocity = 0;
let autoTime = true;
let hide = false;
let hideUI = false;
let hideMulti = false;
let message = "akjsauhsuahusauy";

const decelerationRate = 0.98;

// --- Utility Functions ---

function updateScaling() {
    const rect = canvas.getBoundingClientRect();
    rectL = rect.left;
    rectT = rect.top;
    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
}

function isOverObject(x, y, object, doSquares) {
  if (doSquares) {
    // UPDATED: Use object.x as the left boundary
    const left = object.x;
    const right = object.x + object.size;
    const top = object.y;
    const bottom = object.y + object.size;

    return x >= left && x <= right && y >= top && y <= bottom;
  } else {
    const distance = Math.sqrt(
      Math.pow(x - object.x, 2) + Math.pow(y - object.y, 2)
    );
    return distance <= object.size;
  }
}

function calculateAngle(e) {
  const offsetX = e.clientX - rectL;
  const offsetY = e.clientY - rectT;
  const mouseX = offsetX * scaleX;
  const mouseY = offsetY * scaleY;
  const angle = Math.atan2(mouseY - chamber.y, mouseX - chamber.x);
  return angle;
}

function getRelativeMousePos(mouseX, mouseY, angle) {
  const translatedX = mouseX - chamber.x;
  const translatedY = mouseY - chamber.y;

  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);

  const rotatedX = translatedX * cos - translatedY * sin;
  const rotatedY = translatedX * sin + translatedY * cos;

  return { x: rotatedX, y: rotatedY };
}

function computeCurrentSlot(angle) {
  const slotAngle = (2 * Math.PI) / chamber.slots;
  // Marker is at -Math.PI/2 (top).
  const raw = (-Math.PI / 2 - slotAngle / 2 - angle) / slotAngle;
  const index = Math.round(raw) % chamber.slots;
  return (index + chamber.slots) % chamber.slots;
}

// --- Event Handlers (Mouse) ---

document.addEventListener("mouseup", (e) => {
  const offsetX = e.clientX - rectL;
  const offsetY = e.clientY - rectT;
  const mouseX = offsetX * scaleX;
  const mouseY = offsetY * scaleY;
  if (isDragging) {
    isDragging = false;
    canvas.style.cursor = "grab";
  }
  if (isDraglive) {
    let isKindaLoaded = false;
    isDraglive = false;
    draBdex = -1;
    canvas.style.cursor = "grab";
    for (let i = 0; i < chamber.slots; i++) {
      const slotAngle = (2 * Math.PI) / chamber.slots;
      const a = i * slotAngle;
      const relativeMouse = getRelativeMousePos(mouseX, mouseY, rotationAngle);
      const dynamicliveSize = (chamber.size * lives.size) / 110;
      const dynamicInnerRadius = (chamber.size * chamber.innerRadius) / 110;
      const bx = Math.cos(a + slotAngle / 2) * dynamicInnerRadius;
      const by = Math.sin(a + slotAngle / 2) * dynamicInnerRadius;
      const liveUI = {
        size: dynamicliveSize,
        x: bx,
        y: by,
      };
      if (isOverObject(relativeMouse.x, relativeMouse.y, liveUI)) {
        isKindaLoaded = true;
        if (chamber.chamberContent[i] === "empty") {
          chamber.chamberContent[i] = "live";
          messages.queue.push(`Loaded live into the ${i} slot!`);
        } else {
          messages.queue.push(`this slot is already loaded I think`);
        }
        break;
      }
    }
    if (!isKindaLoaded) {
      messages.queue.push("SHIT, I missed!");
    }
  }
});
canvas.addEventListener("mousemove", (e) => {
  const offsetX = e.clientX - rectL;
  const offsetY = e.clientY - rectT;
  const mouseX = offsetX * scaleX;
  const mouseY = offsetY * scaleY;
  //live shits
  const currSlots = chamber.currentPosition;
  const loadedOnes = chamber.chamberContent.filter((s) => s === "live").length;
  const availableOnes = chamber.slots - loadedOnes;

  let isOverlive = false;
  let isOverXBeton = false;
  let isOverBlank = false;

  if (mouseX >= 15 && mouseX <= 65) {
    for (let i = 0; i < availableOnes; i++) {
      const currentY = lives.y + i * 45;
      const liveUI = { x: lives.x, y: currentY, size: lives.size };
      if (isOverObject(mouseX, mouseY, liveUI)) {
        isOverlive = true;
        break;
      }
    }
  }

  if (isDraglive) {
    bdx = mouseX;
    bdy = mouseY;
    return; // JANGAN lakukan pemeriksaan chamber
  }

  // CHANGED: Use the new top-left coordinates for hit detection
  if (isOverObject(mouseX, mouseY, square, true)) {
    isOverXBeton = true;
  }

  for (let i = 0; i < chamber.slots; i++) {
    const relativeMouse = getRelativeMousePos(mouseX, mouseY, rotationAngle);
    const slotAngle = (2 * Math.PI) / chamber.slots;
    const dynamicliveSize = (chamber.size * lives.size) / 110;
    const dynamicInnerRadius = (chamber.size * chamber.innerRadius) / 110;
    if (chamber.chamberContent[i] === "blank") {
      const a = i * slotAngle;

      const bx = Math.cos(a + slotAngle / 2) * dynamicInnerRadius;
      const by = Math.sin(a + slotAngle / 2) * dynamicInnerRadius;
      const liveUI = {
        size: dynamicliveSize,
        x: bx,
        y: by,
      };
      if (isOverObject(relativeMouse.x, relativeMouse.y, liveUI)) {
        isOverBlank = true;
        isDragging = false;
      }
    }
  }

  //chamber shits
  if (isOverBlank === true) {
    canvas.style.cursor = "pointer";
  } else if (isOverObject(mouseX, mouseY, chamber)) {
    canvas.style.cursor = isDragging ? "grabbing" : "grab";
  } else if (isOverlive === true) {
    canvas.style.cursor = "grab";
  } else if (isOverXBeton === true) {
    canvas.style.cursor = "pointer";
  } else {
    canvas.style.cursor = "default";
  }

  if (!isDragging) return;

  const currentAngle = calculateAngle(e);
  console.log(currentAngle);
  let deltaAngle = currentAngle - lastAngle;

  if (deltaAngle > Math.PI) {
    deltaAngle -= 2 * Math.PI;
  } else if (deltaAngle < -Math.PI) {
    deltaAngle += 2 * Math.PI;
  }

  rotationAngle += deltaAngle;
  rotationVelocity = deltaAngle / 1.3;
  lastAngle = currentAngle;
});

canvas.addEventListener("mousedown", (e) => {
  const offsetX = e.clientX - rectL;
  const offsetY = e.clientY - rectT;
  const mouseX = offsetX * scaleX;
  const mouseY = offsetY * scaleY;

  // live shits
  const currSlots = chamber.currentPosition;
  const loadedOnes = chamber.chamberContent.filter((s) => s === "live").length;
  const availableOnes = chamber.slots - loadedOnes;

  if (mouseX >= 15 && mouseX <= 65) {
    for (let i = 0; i < availableOnes; i++) {
      const currentY = lives.y + i * 45;
      const liveUI = { x: lives.x, y: currentY, size: lives.size };

      if (isOverObject(mouseX, mouseY, liveUI)) {
        isDraglive = true;
        draBdex = i;
        bdx = mouseX;
        bdy = mouseY;
        isDragging = false;
        canvas.style.cursor = "grabbing";
        return;
      }
    }
  }
  for (let i = 0; i < chamber.slots; i++) {
    const relativeMouse = getRelativeMousePos(mouseX, mouseY, rotationAngle);
    const slotAngle = (2 * Math.PI) / chamber.slots;
    const dynamicliveSize = (chamber.size * lives.size) / 110;
    const dynamicInnerRadius = (chamber.size * chamber.innerRadius) / 110;
    if (chamber.chamberContent[i] === "blank") {
      const a = i * slotAngle;

      const bx = Math.cos(a + slotAngle / 2) * dynamicInnerRadius;
      const by = Math.sin(a + slotAngle / 2) * dynamicInnerRadius;
      const liveUI = {
        size: dynamicliveSize,
        x: bx,
        y: by,
      };
      if (isOverObject(relativeMouse.x, relativeMouse.y, liveUI)) {
        messages.queue.push(`Ejected: ${i}`);
        chamber.chamberContent[i] = "empty";
      }
    }
  }

  // Chamber shits
  if (isOverObject(mouseX, mouseY, chamber)) {
    rotationVelocity = 0;
    isDragging = true;
    lastAngle = calculateAngle(e);
    canvas.style.cursor = "grabbing";
  }

  // CHANGED: Use the new top-left coordinates for hit detection
  if (isOverObject(mouseX, mouseY, square, true)) {
    hideUI = !hideUI;
  }
});

// yeah, ui animation. Cool?
function animationUpdate() {
  if (messages.state === "idle") {
    if (messages.queue.length > 0) {
      // pick next message
      messages.active = messages.queue.shift();
      // start off screen
      messages.y = canvas.height + 20;
      messages.state = "slidingUp";
    }
  } else if (messages.state === "slidingUp") {
    messages.y -= messages.powerpoint;
    if (messages.y <= messages.target) {
      messages.y = messages.target;
      messages.state = "waiting";
      messages.timer = 0;
    }
  } else if (messages.state === "waiting") {
    messages.timer++;
    if (messages.queue.length > 0) {
      // new message arrived
      messages.active = messages.queue.shift();
      messages.y = canvas.height + 20;
      messages.state = "slidingUp";
    } else if (messages.timer >= messages.wait) {
      messages.state = "slidingDown";
    }
  } else if (messages.state === "slidingDown") {
    messages.y += messages.powerpoint;
    if (messages.y > canvas.height + 20) {
      messages.state = "idle";
      messages.active = null;
    }
  }

  if (chamber.chamberStatus === "fired") {
    chamber.y += 15;
    chamber.size += 15;
    if (chamber.y > canvas.height / 2 + 30 && chamber.size > 140) {
      chamber.y = canvas.height / 2 + 30;
      chamber.size = 130;
      chamber.chamberStatus = "backup";
    }
  } else if (chamber.chamberStatus === "backup") {
    chamber.y -= 2;
    chamber.size -= 2;
    if (chamber.y <= canvas.height / 2 && chamber.size <= 110) {
      chamber.size = 110;
      chamber.y = canvas.height / 2;
      chamber.chamberStatus = "idle";
    }
  }
}

// --- Game Logic ---

function update() {
  // const randam = Math.round(Math.random()) * rotationVelocity - rotationVelocity * 0.5;

  if (!isDragging) {
    rotationAngle += rotationVelocity;
    rotationVelocity *= decelerationRate;

    if (Math.abs(rotationVelocity) < 0.012) {
      // Snap to nearest slot angle when nearly stopped
      const slotAngle = (2 * Math.PI) / chamber.slots;
      const midSlot = slotAngle / 2;
      const targEt = -Math.PI / 2;
      const totalitas = midSlot - targEt;

      const passedSlot = Math.round((rotationAngle + totalitas) / slotAngle);
      const nearestAngle = passedSlot * slotAngle - totalitas;

      // Ease toward nearest angle
      rotationAngle += (nearestAngle - rotationAngle) * 0.2;

      if (Math.abs(nearestAngle - rotationAngle) < 0.001) {
        rotationAngle = nearestAngle;
        rotationVelocity = 0;
      }
    }
  }

  // keep currentPosition in sync
  chamber.currentPosition = computeCurrentSlot(rotationAngle);
  console.log(chamber.currentPosition, rotationAngle);
}

function fire() {
  // when pulling the trigger we advance one chamber then check
  const idx = chamber.currentPosition;

  if (chamber.chamberContent[idx] === "live") {
    // Hit!
    firedSfx.pause();
    firedSfx.currentTime = 0.003;
    firedSfx.play();

    score = 0;
    chamber.chamberContent[idx] = "blank";
    chamber.holes[idx] = true; // mark hole for that slot

    // quick flash effect: briefly tint the chamber color
    const old = chamber.colour;
    const fireMessage = [
      "Pew-pew",
      "Yahoo",
      "Nailed it!",
      "This FUN!",
      "cool!",
    ];
    const randomMSG = Math.floor(Math.random() * fireMessage.length);
    chamber.colour = "#ffcc99";
    setTimeout(() => (chamber.colour = old), 120);
    console.log(fireMessage[randomMSG]);
    messages.queue.push(fireMessage[randomMSG]);
    chamber.chamberStatus = "fired";
  } else {
    // Miss!
    const livesLeft = chamber.chamberContent.filter(
      (slot) => slot === "lives"
    ).length;
    let missMessage = [
      "empty.",
      "awh man, c'mon",
      "no hit.",
      "Am I lucky or not?",
    ];

    if (livesLeft > 1 && !hide) {
      missMessage = [
        "empty.",
        "awh man, c'mon",
        "no hit.",
        "Am I lucky or not?",
      ];
    } else if (hide === true || livesLeft === 1) {
      missMessage = [
        "I almost got it, I think.",
        "What a luck, to still alive.",
        "Near D E A T H.",
        "luck is on our side!",
        "*sigh* Almost death isn'it?",
      ];
    }
    const randomMSG = Math.floor(Math.random() * missMessage.length);
    messages.queue.push(missMessage[randomMSG]);
    score++;

    // click sound placeholder or small visual feedback
    missedSfx.pause();
    missedSfx.currentTime = 0.05;
    missedSfx.play();
    chamber.colour = "#ccc";
    setTimeout(() => (chamber.colour = "gray"), 80);
  }

  // rotate to next chamber (simulate trigger rotating cylinder)
  if (autoTime === true) {
    const step = (0.925 * Math.PI) / chamber.slots;
    // add velocity so rotation animates to next slot
    rotationVelocity = -step;
  }
}

// --- Drawing / Rendering ---

function drawThings(ctx, angle, any) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear full canvas
  const livesLeft = chamber.chamberContent.filter((s) => s === "live").length;
  if (hideUI === false) {
    const dynamicliveSize = (chamber.size * lives.size) / 110;
    const dynamicInnerRadius = (chamber.size * chamber.innerRadius) / 110;
    const dynamicTipSize = (chamber.size * lives.tip) / 110;
    const dynammicTipTipSize = (chamber.size * lives.tiptip) / 110;

    ctx.save();
    ctx.translate(chamber.x, chamber.y);
    ctx.rotate(angle);

    // Outer cylinder
    ctx.beginPath();
    ctx.arc(0, 0, chamber.size, 0, Math.PI * 2);
    ctx.fillStyle = chamber.colour;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Draw slot separators and lives + holes
    const slotAngle = (2 * Math.PI) / chamber.slots;

    for (let i = 0; i < chamber.slots; i++) {
      const a = i * slotAngle;

      // Separator lines
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * chamber.size, Math.sin(a) * chamber.size);
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw live hole at the outer rim if that slot has been fired
      const hx = Math.cos(a + slotAngle / 2) * dynamicInnerRadius;
      const hy = Math.sin(a + slotAngle / 2) * dynamicInnerRadius;

      if (chamber.holes[i]) {
        // Dark inner hole
        ctx.beginPath();
        ctx.fillStyle = "#111";
        ctx.arc(hx, hy, dynamicliveSize, 0, Math.PI * 2);
        ctx.fill();

        // Light rim
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.arc(hx, hy, dynamicTipSize, 0, Math.PI * 2);
        ctx.stroke();
      }

      // lives (draw at innerRadius)
      const bx = Math.cos(a + slotAngle / 2) * dynamicInnerRadius;
      const by = Math.sin(a + slotAngle / 2) * dynamicInnerRadius;

      if (chamber.chamberContent[i] === "live") {
        // Main live
        ctx.beginPath();
        ctx.fillStyle = lives.colour;
        ctx.arc(bx, by, dynamicliveSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = lives.outline;
        ctx.stroke();

        // live tip
        ctx.beginPath();
        ctx.fillStyle = lives.insideColour;
        ctx.arc(bx, by, dynamicTipSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = lives.insideOutline;
        ctx.stroke();

        //live tiptip
        ctx.beginPath();
        ctx.fillStyle = lives.tiptipColour;
        ctx.arc(bx, by, dynammicTipTipSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = lives.tiptipOutline;
        ctx.stroke();
      } else if (chamber.chamberContent[i] === "blank") {
        // Main live
        ctx.beginPath();
        ctx.fillStyle = lives.colour;
        ctx.arc(bx, by, dynamicliveSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = lives.outline;
        ctx.stroke();

        // live tip
        ctx.beginPath();
        ctx.fillStyle = lives.insideColour;
        ctx.arc(bx, by, dynamicTipSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = lives.insideOutline;
        ctx.stroke();

        //live tiptip (GONE reduced to atoms)
      }

      if (hide === true) {
        // Cover lives with SPY? (you i found a spy over here)
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(bx, by, lives.size + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#000000ff";
        ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#534646ff";
        ctx.lineWidth = 2;
        ctx.arc(bx, by, lives.size + 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Draw fixed marker at top (shows which slot is lined up to fire)
    ctx.fillStyle = "grey";
    ctx.beginPath();
    const mx = chamber.x;
    const my = chamber.y - chamber.size - 6;

    ctx.moveTo(mx - chamber.markerSize / 2, my);
    ctx.lineTo(mx + chamber.markerSize / 2, my);
    ctx.lineTo(mx, my - chamber.markerSize);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Square around object live area
    ctx.strokeStyle = "black";
    ctx.lineWidth = 4;
    ctx.strokeRect(15, lives.y - 25, 50, chamber.slots * 46);
    ctx.fillStyle = "#575757ff";
    ctx.fillRect(15, lives.y - 25, 50, chamber.slots * 46);

    // Object live! (fake live for reloading fr fr)
    for (let i = 0; i < chamber.slots; i++) {
      if (chamber.holes[i]) {
        // Draw dark hole/empty slot marker
        ctx.beginPath();
        ctx.fillStyle = "#111";
        ctx.arc(40, lives.y + i * 45, lives.size, 0, Math.PI * 2);
        ctx.fill();

        // Light rim
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.12)";
        ctx.lineWidth = 1;
        ctx.arc(40, lives.y + i * 45, 8.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw real lives available to load (in the sidebar UI)
    const emptySlotsCount = chamber.slots - livesLeft;
    for (let i = 0; i < emptySlotsCount; i++) {
      // Rel bellet
      if (isDraglive && i === draBdex) {
        continue;
      }
      const currentY = lives.y + i * 45;

      // Main live
      ctx.beginPath();
      ctx.fillStyle = lives.colour;
      ctx.arc(40, currentY, lives.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.outline;
      ctx.stroke();

      // live tip
      ctx.beginPath();
      ctx.fillStyle = lives.insideColour;
      ctx.arc(40, currentY, lives.tip, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.insideOutline;
      ctx.stroke();

      //live tiptip
      ctx.beginPath();
      ctx.fillStyle = lives.tiptipColour;
      ctx.arc(40, currentY, dynammicTipTipSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.tiptipOutline;
      ctx.stroke();
    }
    //the drag able live! (yippie)
    if (isDraglive) {
      // Draw the currently dragged live (on top layer)
      ctx.beginPath();
      ctx.fillStyle = lives.colour;
      ctx.arc(bdx, bdy, lives.size * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.outline;
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = lives.insideColour;
      ctx.arc(bdx, bdy, lives.tip * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.insideOutline;
      ctx.stroke();

      //live tiptip
      ctx.beginPath();
      ctx.fillStyle = lives.tiptipColour;
      ctx.arc(bdx, bdy, lives.tiptip * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lives.tiptipOutline;
      ctx.stroke();
    }
  }
  //Uhided Ui
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.font = "14px sans-serif";
  // Text uiiii/Betons
  ctx.fillText(`Slot: ${chamber.currentPosition}`, 10, 20);
  ctx.fillText(`lives: ${livesLeft} / ${chamber.slots}`, 10, 40);
  ctx.fillText(`Not Hit: ${score}`, 10, 60);
  ctx.fillText(
    `hello: ${chamber.chamberStatus}, rotate: ${rotationAngle}`,
    10,
    80
  );

  ctx.textAlign = "center";
  ctx.fillText(`${messages.active}`, canvas.width / 2, messages.y);

  //squarefor tiggle chamber on na off.
  square.y - square.size / 2;
  // CHANGED: Draw the rect using the new top-left coordinates (square.x, square.y)
  ctx.beginPath();
  ctx.rect(square.x, square.y, square.size, square.size);
  ctx.fillStyle = square.colour;
  ctx.fill();
  ctx.strokeStyle = square.strokeColour;
  ctx.lineWidth = 3;
  ctx.stroke();

  // X for visual
  // The 'X' drawing coordinates must be shifted to match the new square position
  const xCenter = square.x + 4; // Shifted from right edge (canvas.width - 30 - 4) to left edge (canvas.width - 60 + 4)
  const yCenter = square.y + 4;
  ctx.beginPath();
  ctx.moveTo(xCenter, yCenter);
  ctx.lineTo(xCenter + 21, yCenter + 21); // Draw from top-left to bottom-right
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(xCenter, yCenter + 21);
  ctx.lineTo(xCenter + 21, yCenter); // Draw from bottom-left to top-right
  ctx.stroke();
}

function drawGame() {
  update();
  drawThings(ctx, rotationAngle);
  requestAnimationFrame(drawGame);
  animationUpdate();
}

// --- Event Handlers (Keyboard & UI) ---

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    fire();
  } else if (e.code === "KeyR") {
    e.preventDefault();
    for (let i = 0; i < chamber.slots; i++) {
      if (chamber.chamberContent[i] === "empty") {
        chamber.chamberContent[i] = "live";
        chamber.holes[i] = true;

        messages.queue.push("Reloaded all slot! (how)");
      }
    }
  }
});

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.getAttribute("data-does");

    if (action === "noClick") {
      if (count >= 109) {
        count++;
        button.textContent = "I SAID NO CLICKING!";
      } else if (count >= 99) {
        button.textContent = "okay, you can stop, here a piece of my secret...";
        Secrets1.style.display = "block";
      } else if (count >= 49) {
        count++;
        button.textContent =
          "Wow, you really like clicking that button, don't you?" +
          " (" +
          count +
          ")";
      } else if (count >= 1) {
        count++;
        button.textContent = "ok fine you can click more! " + "(" + count + ")";
      } else {
        count++;
        button.textContent = "i told you not to click me!";
      }
    }

    if (action === "noMoreClick") {
      if (count >= 109) {
        button.textContent = "...";
        Secrets1.style.display = "none";
      } else if (count >= 99) {
        count++;
        button.textContent = "Please, I'm begging you...";
      }
    }

    if (action === "hide") {
      hide = !hide;
    }
    if (action === "multiplayer") {
      hideMulti = !hideMulti;
      multiplayer.style.display = hideMulti ? "block" : "none";
    }
    if (action === "yesclick") {
      if (counti >= 99) {
        counti = 0;
        button.textContent = `well that's enough i guess (${counti})`;
        chamber.slots = 6;
        chamber.chamberContent = new Array(chamber.slots).fill("empty");
        chamber.holes = new Array(chamber.slots).fill(true);
      }

      if (counti >= 49) {
        counti++;
        button.textContent = `woah (${counti})`;
        chamber.slots++;
        chamber.chamberContent = new Array(chamber.slots).fill("empty");
        chamber.holes = new Array(chamber.slots).fill(true);
      } else if (counti >= 0) {
        counti++;
        button.textContent = `wlep (${counti})`;
      }
    }
  });
});

//misc shittattatatataattatat lakopolosto
window.addEventListener('load', updateScaling);
window.addEventListener('resize',updateScaling);

// --- Start Game Loop ---

drawGame();
