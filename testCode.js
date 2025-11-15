// idk
const firedSfx = new Audio("Shits/shot.mp3");
const missedSfx = new Audio("Shits/click.mp3");

// const typa shit

const Secrets1 = document.getElementById("Secrets1");
const buttons = document.querySelectorAll(".buttons");
const gaem = document.getElementById("gaem");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const rect = canvas.getBoundingClientRect();

const center = { x: 400, y: 300 };
const canvasXoffset = rect.left;
const canvasYoffset = rect.top;

const chamber = {
  chamberContent: ["empty", "bullet", "empty", "empty", "empty", "empty"], // initial content
  size: 110,
  colour: "gray",
  currentPosition: 0,
  isSpinning: false,
  slots: 6 , // number of chambers (collerrr)
  innerRadius: 60, // radius where bullets are drawn
  markerSize: 14, // visual marker size
  holes: null,
  x: 400,
  y: 300,
};

//another object


const bullets = {
  object: true,
  size: 20,
  colour: "#f7e840",
  outline: "#bdb12d",
  insideColour: "#a5a387ff",
  insideOutline: "#6b651fff",
  x: 40,
  y: canvas.height / 2 - (chamber.slots / 2) * 40,
};

// --- Initialization & Game State ---

chamber.chamberContent = new Array(chamber.slots).fill("empty");
chamber.holes = new Array(chamber.slots).fill(true); // Chamber holes/marks

let count = 0;
let score = 0;
let isDragging = false;
let isDragObj = false;
let isDragBullet = false;
let draBdex = -1;
let bdx = 0;
let bdy = 0;
let rotationAngle = 0;
let lastAngle = 0;
let rotationVelocity = 0;
let autoTime = true;
let hide = false;

const decelerationRate = 0.98;

// --- Utility Functions ---

function isOverObject(x, y, object) {
  const distance = Math.sqrt(
    Math.pow(x - object.x, 2) + Math.pow(y - object.y, 2)
  );
  return distance <= object.size;
}

function calculateAngle(e) {
  const mouseX = e.clientX - canvas.offsetLeft;
  const mouseY = e.clientY - canvas.offsetTop;
  const angle = Math.atan2(mouseY - center.y, mouseX - center.x);
  return angle;
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
  if (isDragging) {
    isDragging = false;
    canvas.style.cursor = "grab";
  }
  if (isDragBullet) {
    isDragBullet = false;
    draBdex = -1;
    canvas.style.cursor = "grab";
  }
});

canvas.addEventListener("mousemove", (e) => {
  const mouseX = e.clientX - canvasXoffset;
  const mouseY = e.clientY - canvasYoffset;
  //bullet shits
  const loadedOnes = chamber.chamberContent.filter((s) => s === 'bullet').length;
  const availableOnes = chamber.slots - loadedOnes;

  let isOverBullet = false

  if ((mouseX >= 15 && mouseX <= 65)) {
    for (let i = 0; i < availableOnes; i++) {
      const currentY = bullets.y + i * 45;
      const bulletUI = { x: bullets.x, y: currentY, size: bullets.size };
      if (isOverObject(mouseX, mouseY, bulletUI)) {
        isOverBullet = true;
        break;
      }
    }
  }

  if (isDragBullet) {
      bdx = mouseX;
      bdy = mouseY;
      return; // JANGAN lakukan pemeriksaan chamber
  }

  //chamber shits
  if (isOverObject(mouseX, mouseY, chamber)) {
    canvas.style.cursor = isDragging ? "grabbing" : "grab";
  } else if (isOverBullet === true) {
    canvas.style.cursor = "grab";
  } else {
    canvas.style.cursor = "default";
  }

  if (!isDragging) return;

  const currentAngle = calculateAngle(e);
  console.log(currentAngle)
  let deltaAngle = currentAngle - lastAngle;

  if (deltaAngle > Math.PI) {
    deltaAngle -= 2 * Math.PI;
  } else if (deltaAngle < -Math.PI) {
    deltaAngle += 2 * Math.PI;
  }

  rotationAngle += deltaAngle;
  rotationVelocity = deltaAngle;
  lastAngle = currentAngle;
});

canvas.addEventListener("mousedown", (e) => {
  const mouseX = e.clientX - canvasXoffset;
  const mouseY = e.clientY - canvasYoffset;

  // Bullet shits
  const loadedOnes = chamber.chamberContent.filter((s) => s === 'bullet').length;
  const availableOnes = chamber.slots - loadedOnes;

  if (mouseX >= 15 && mouseX <= 65) {
    for (let i = 0; i < availableOnes; i++) {
      const currentY = bullets.y + i * 45;
      const bulletUI = { x: bullets.x, y: currentY, size: bullets.size };

      if (isOverObject(mouseX, mouseY, bulletUI)) {
        isDragBullet = true;
        draBdex = i;
        bdx = mouseX;
        bdy = mouseY;
        rotationVelocity = 0;
        isDragging = false;
        canvas.style.cursor = "grabbing";
        return;
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
});

// --- Game Logic ---

function update() {
  // const randam = Math.round(Math.random()) * rotationVelocity - rotationVelocity * 0.5;

  if (!isDragging && !isDragBullet) {
    rotationAngle -= rotationVelocity;
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
  console.log(chamber.currentPosition, rotationAngle)
}

function fire() {
  // when pulling the trigger we advance one chamber then check
  const idx = chamber.currentPosition;

  if (chamber.chamberContent[idx] === "bullet") {
    // Hit!
    firedSfx.pause();
    firedSfx.currentTime = 0;
    firedSfx.play();

    score = 0;
    chamber.chamberContent[idx] = "empty";
    chamber.holes[idx] = true; // mark hole for that slot

    // quick flash effect: briefly tint the chamber color
    const old = chamber.colour;
    chamber.colour = "#ffcc99";
    setTimeout(() => (chamber.colour = old), 120);
  } else {
    // Miss!
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

function drawThings(ctx, angle) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clear full canvas

  ctx.save();
  ctx.translate(center.x, center.y);
  ctx.rotate(angle);

  // Outer cylinder
  ctx.beginPath();
  ctx.arc(0, 0, chamber.size, 0, Math.PI * 2);
  ctx.fillStyle = chamber.colour;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Draw slot separators and bullets + holes
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

    // Draw bullet hole at the outer rim if that slot has been fired
    const hx = Math.cos(a + slotAngle / 2) * chamber.innerRadius;
    const hy = Math.sin(a + slotAngle / 2) * chamber.innerRadius;
    
    if (chamber.holes[i]) {
      // Dark inner hole
      ctx.beginPath();
      ctx.fillStyle = "#111";
      ctx.arc(hx, hy, bullets.size, 0, Math.PI * 2);
      ctx.fill();

      // Light rim
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.arc(hx, hy, 8.5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Bullets (draw at innerRadius)
    const bx = Math.cos(a + slotAngle / 2) * chamber.innerRadius;
    const by = Math.sin(a + slotAngle / 2) * chamber.innerRadius;

    if (chamber.chamberContent[i] === "bullet") {
      // Main bullet
      ctx.beginPath();
      ctx.fillStyle = bullets.colour;
      ctx.arc(bx, by, bullets.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bullets.outline;
      ctx.stroke();

      // Bullet tip
      ctx.beginPath();
      ctx.fillStyle = bullets.insideColour;
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = bullets.insideOutline;
      ctx.stroke();
    }

    if (hide === true) {
      // Cover bullets with grey circle (visual disguise)
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(bx, by, bullets.size + 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#000000ff";
      ctx.arc(bx, by, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#534646ff";
      ctx.lineWidth = 2;
      ctx.arc(bx, by, bullets.size + 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();

  // Draw fixed marker at top (shows which slot is lined up to fire)
  ctx.fillStyle = "grey";
  ctx.beginPath();
  const mx = center.x;
  const my = center.y - chamber.size - 6;

  ctx.moveTo(mx - chamber.markerSize / 2, my);
  ctx.lineTo(mx + chamber.markerSize / 2, my);
  ctx.lineTo(mx, my - chamber.markerSize);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.stroke();

  // Small UI: show current slot index & bullets left
  ctx.fillStyle = "black";
  ctx.font = "14px sans-serif";
  const bulletsLeft = chamber.chamberContent.filter(
    (s) => s === "bullet"
  ).length;

  ctx.fillText(`Slot: ${chamber.currentPosition}`, 10, 20);
  ctx.fillText(`Bullets: ${bulletsLeft} / ${chamber.slots}`, 10, 40);
  ctx.fillText(`Not Hit: ${score}`, 10, 60);

  // Square around object bullet area
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.strokeRect(15, bullets.y - 25, 50, chamber.slots * 46);
  ctx.fillStyle = "#575757ff";
  ctx.fillRect(15, bullets.y - 25, 50, chamber.slots * 46);

  // Object bullet! (fake bullet for reloading fr fr)
  for (let i = 0; i < chamber.slots; i++) {
    if (chamber.holes[i]) {
      // Draw dark hole/empty slot marker
      ctx.beginPath();
      ctx.fillStyle = "#111";
      ctx.arc(40, bullets.y + i * 45, bullets.size, 0, Math.PI * 2);
      ctx.fill();

      // Light rim
      ctx.beginPath();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1;
      ctx.arc(40, bullets.y + i * 45, 8.5, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // Draw real bullets available to load (in the sidebar UI)
  const emptySlotsCount = chamber.slots - bulletsLeft;
  for (let i = 0; i < emptySlotsCount; i++) {
    // Rel bellet
    if (isDragBullet && i === draBdex) {
        continue;
    }
    const currentY = bullets.y + i * 45;
    
    // Main bullet
    ctx.beginPath();
    ctx.fillStyle = bullets.colour;
    ctx.arc(40, currentY, bullets.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bullets.outline;
    ctx.stroke();

    // Bullet tip
    ctx.beginPath();
    ctx.fillStyle = bullets.insideColour;
    ctx.arc(40, currentY, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // 6; // Removed stray number
    
    ctx.strokeStyle = bullets.insideOutline;
    ctx.stroke();
  }
  //the drag able bullet! (yippie)
  if (isDragBullet) {
    // Draw the currently dragged bullet (on top layer)
    ctx.beginPath();
    ctx.fillStyle = bullets.colour;
    ctx.arc(bdx, bdy, bullets.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bullets.outline;
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = bullets.insideColour;
    ctx.arc(bdx, bdy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = bullets.insideOutline;
    ctx.stroke();
  }
}

function drawGame() {
  update();
  drawThings(ctx, rotationAngle);
  requestAnimationFrame(drawGame);
}

// --- Event Handlers (Keyboard & UI) ---

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    fire();
  }

  if (e.code === "KeyR") {
    // Reload a random empty slot
    const emptySlots = chamber.chamberContent
      .map((s, i) => {
        if (s === "empty") return i;
        return undefined;
      })
      .filter((i) => i !== undefined);

    if (emptySlots.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * emptySlots.length);
    const slotToLoad = emptySlots[randomIndex];

    chamber.chamberContent[slotToLoad] = "bullet";
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
  });
});

// --- Start Game Loop ---

drawGame();