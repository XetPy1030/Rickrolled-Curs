const apples = [];
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function getRandomHEXColor() {
    return "#" + Math.floor(Math.random()*16777215).toString(16);
}

function generateApples() {
    // Clear existing apples
    apples.length = 0;

    // Generate 3 apples
    let i = 0;
    // Get all platforms except ground
    const availablePlatforms = platforms.slice(1); // Skip ground platform
    if (availablePlatforms.length === 0) return;

    // Create copy of platforms array to remove used ones
    let remainingPlatforms = [...availablePlatforms];

    while (i < 3 && remainingPlatforms.length > 0) {
        // Select random platform from remaining ones
        const randomIndex = Math.floor(Math.random() * remainingPlatforms.length);
        const platform = remainingPlatforms[randomIndex];
        
        // Remove selected platform so we don't use it again
        remainingPlatforms.splice(randomIndex, 1);
        
        // Position apple above the platform, ensuring it stays within screen bounds
        const appleSize = 30;
        const minX = Math.max(platform.x, 0);
        const maxX = Math.min(platform.x + platform.width - appleSize, canvas.width - appleSize);
        const x = minX + Math.random() * (maxX - minX);
        
        // Ensure apple doesn't go above screen
        const y = Math.max(platform.y - 50, appleSize); // Position 50px above platform but not above screen

        console.log(`Generating apple ${i} at x:${x}, y:${y} on platform ${randomIndex}`);
        
        apples.push({
            x: x,
            y: y,
            width: appleSize,
            height: appleSize,
            collected: false
        });
        
        i++;
    }
}

function drawApple(apple) {
    if (!apple.collected) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(apple.x + 15, apple.y + 15, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw apple stem
        ctx.strokeStyle = "brown";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(apple.x + 15, apple.y);
        ctx.lineTo(apple.x + 15, apple.y - 10);
        ctx.stroke();
    }
}

function checkAppleCollision(player, apple) {
    if (!apple.collected &&
        player.x < apple.x + apple.width &&
        player.x + player.width > apple.x &&
        player.y < apple.y + apple.height &&
        player.y + player.height > apple.y) {
        apple.collected = true;
        // You can add score or other effects here
    }
}


const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 400;

const platforms = [];

function generatePlatforms() {
    // Clear existing platforms
    platforms.length = 0;
    
    // Add ground platform
    platforms.push({
        x: 0,
        y: canvas.height - 50,
        width: canvas.width,
        height: 50,
        color: "#4a2700"
    });

    // Generate random platforms
    const minWidth = 100;
    const maxWidth = 200;
    const minGap = 100;
    const maxGap = 200;
    const minHeight = canvas.height - 300;
    const maxHeight = canvas.height - 100;

    const platformMargin = 100;

    let lastX = platformMargin;

    // Keep generating platforms until we reach the end of the screen
    while (lastX < canvas.width - platformMargin) {
        const width = Math.random() * (maxWidth - minWidth) + minWidth;
        const height = 20;
        const x = lastX + Math.random() * (maxGap - minGap) + minGap;
        const y = Math.random() * (maxHeight - minHeight) + minHeight;

        platforms.push({
            x: x,
            y: y,
            width: width,
            height: height,
            color: "#4a2700"
            // color: getRandomHEXColor()
        });

        lastX = x + width;
    }
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

const game = {
    isRunning: false,
    numPlatforms: 8,
    
}

const player = {
  x: 200,
  y: canvas.height - 300,
  width: 50,
  height: 50,
  color: "#ff0000",
  speed: 5,
  dy: 0,
  gravity: 0.5,
  jumping: false,
};

const curse = {
  x: -100,
  y: canvas.height - 200,
  width: 60,
  height: 60,
  color: "#000000",
  speed: 2,

  farSpeedMultiplier: 2.5,
  closeSpeedMultiplier: 1.7,
  momentum: 0.98,
};

let keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function updatePlayer() {
  // Handle horizontal movement with bounds checking
  if (keys["ArrowRight"]) {
    player.x = Math.min(player.x + player.speed, canvas.width - player.width);
  }
  if (keys["ArrowLeft"]) {
    player.x = Math.max(player.x - player.speed, 0);
  }

  if (keys["Space"] && !player.jumping) {
    player.dy = -16;
    player.jumping = true;
  }

  player.dy += player.gravity;
  
  // Check platform collisions before updating position
  let onPlatform = false;
  platforms.forEach(platform => {
    const futureY = player.y + player.dy;
    
    // Check if player will collide with platform
    if (player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height <= platform.y &&
        futureY + player.height >= platform.y) {
      
      // Land on platform
      player.y = platform.y - player.height;
      player.dy = 0;
      player.jumping = false;
      onPlatform = true;
    }
  });

  if (!onPlatform) {
    player.y += player.dy;
  }

  // Ground collision
  if (player.y > canvas.height - player.height) {
    player.y = canvas.height - player.height;
    player.jumping = false;
  }
}

function updateCurse() {
  // Calculate direction to player
  let dx = player.x - curse.x;
  let dy = player.y - curse.y;
  let distance = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vector
  dx = dx / distance;
  dy = dy / distance;

  // Adjust speed based on distance
  let targetSpeed = curse.speed;
  if (distance > 300) {
    targetSpeed = curse.speed * curse.farSpeedMultiplier; // Speed up when far away
  } else if (distance < 100) {
    targetSpeed = curse.speed * curse.closeSpeedMultiplier; // Slow down when close
  }

  // Add momentum/inertia effect
  curse.vx = (curse.vx || 0) * curse.momentum + dx * targetSpeed * (1 - curse.momentum);
  curse.vy = (curse.vy || 0) * curse.momentum + dy * targetSpeed * (1 - curse.momentum);

  // Update position
  curse.x += curse.vx;
  curse.y += curse.vy;

  // Keep curse within canvas bounds
  if (curse.x < 0) curse.x = 0;
  if (curse.x > canvas.width - curse.width) curse.x = canvas.width - curse.width;
  if (curse.y < 0) curse.y = 0;
  if (curse.y > canvas.height - curse.height) curse.y = canvas.height - curse.height;


  // Проверка столкновения
  if (
    player.x < curse.x + curse.width &&
    player.x + player.width > curse.x &&
    player.y < curse.y + curse.height &&
    player.y + player.height > curse.y
  ) {
    alert("Проклятие настигло вас! Игра окончена.");
    game.isRunning = false;
    document.location.reload();
  }
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawCurse() {
  ctx.fillStyle = curse.color;
  ctx.fillRect(curse.x, curse.y, curse.width, curse.height);
}

function drawApples() {
  apples.forEach(apple => drawApple(apple));
}

function updateApples() {
  apples.forEach(apple => {
    checkAppleCollision(player, apple);
  });

  // Check if all apples are collected
  if (apples.every(apple => apple.collected)) {
    game.isRunning = false;

    document.getElementById("screamer").style.display = "block";
    const screamerVideo = document.getElementById("screamer-video-element");
    screamerVideo.play();
    screamerVideo.addEventListener("ended", function() {
        document.getElementById("rickroll-screen").style.display = "block";
        document.getElementById("rickroll-video-element").play();
    });
  }
}

function gameLoop(timestamp) {
  if (!game.isRunning) return;

  const deltaTime = timestamp - lastTime;

  if (deltaTime >= frameInterval) {
    lastTime = timestamp - (deltaTime % frameInterval);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    updateCurse();
    updateApples();
    
    drawPlatforms();
    drawPlayer();
    drawCurse();
    drawApples();
  }

  requestAnimationFrame(gameLoop);
}

function startGame() {
  game.isRunning = true;
  generatePlatforms();
  generateApples();
  lastTime = performance.now();
  gameLoop(lastTime);
}

// startGame();
