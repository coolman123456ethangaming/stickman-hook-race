const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerDisplay = document.getElementById('timer');
const botTimerDisplay = document.getElementById('botTimer');
const botStatusDisplay = document.getElementById('botStatus');
const friendStatusDisplay = document.getElementById('friendStatus');
const inviteFriendBtn = document.getElementById('inviteFriendBtn');
const startRaceBtn = document.getElementById('startRaceBtn');
const startPracticeBtn = document.getElementById('startPracticeBtn');
const startPracticeGameBtn = document.getElementById('startPracticeGameBtn');
const showBotCheckbox = document.getElementById('showBotCheckbox');
const friendUrlInput = document.getElementById('friendUrl');
const menu = document.getElementById('menu');
const gameArea = document.getElementById('gameArea');
const practiceOptions = document.getElementById('practiceOptions');

canvas.width = 800;
canvas.height = 600;

let stickman = { x: 100, y: 100, radius: 15, vx: 0, vy: 0, gravity: 0.5, isHooked: false };
let bot = { x: 100, y: 100, radius: 15, vx: 0, vy: 0, gravity: 0.5, isHooked: false, speedFactor: 0.95 };  // Bot moves slightly faster
let showBot = false;
let startTime, botStartTime;
let isGameRunning = true;
let isPracticeMode = false;
let levelSeed = getLevelSeed();
let hasFriendFinished = false;

// Handle Level Seed
function getLevelSeed() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('seed') || Math.floor(Math.random() * 10000);
}

// Save player's finish time to local storage
function savePlayerTime(time) {
    const raceId = `race_${levelSeed}`;
    localStorage.setItem(raceId, JSON.stringify({ playerTime: time, friendFinished: hasFriendFinished }));
}

// Check if both players have finished
function checkRaceStatus() {
    const raceId = `race_${levelSeed}`;
    const raceData = JSON.parse(localStorage.getItem(raceId));

    if (raceData && raceData.friendFinished && raceData.playerTime) {
        friendStatusDisplay.textContent = `Both players finished! Your time: ${raceData.playerTime}s.`;
    } else if (raceData && raceData.playerTime && !raceData.friendFinished) {
        friendStatusDisplay.textContent = 'Waiting for your friend to finish...';
    }
}

// Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (isGameRunning) {
        stickman.vy += stickman.gravity;
        stickman.x += stickman.vx;
        stickman.y += stickman.vy;

        // Bot movement (slightly faster)
        bot.vy += bot.gravity;
        bot.x += bot.vx * bot.speedFactor;
        bot.y += bot.vy * bot.speedFactor;

        // Check if bot reached the end (if bot is visible or invisible)
        if (bot.x > canvas.width - 50) {
            endBotGame();
        }
    }
    
    // Player reaching end condition
    if (stickman.x > canvas.width - 50) {
        endGame();
    }

    drawHook();
    drawStickman();
    
    // Optionally draw bot if enabled
    if (showBot) {
        drawBot();
    }

    requestAnimationFrame(gameLoop);
}

// End the game and calculate time for player
function endGame() {
    isGameRunning = false;
    const endTime = (Date.now() - startTime) / 1000;
    if (!isPracticeMode) {
        savePlayerTime(endTime);
        checkRaceStatus();
    }
    alert(`You finished in ${endTime} seconds!`);
}

// End the bot's game and display bot's time
function endBotGame() {
    const botEndTime = (Date.now() - botStartTime) / 1000;
    botStatusDisplay.style.display = 'block';
    botTimerDisplay.textContent = botEndTime;
}

// Draw hook and stickman (as in the original game)
function drawHook() {
    ctx.beginPath();
    ctx.arc(400, 300, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

function drawStickman() {
    ctx.beginPath();
    ctx.arc(stickman.x, stickman.y, stickman.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}

function drawBot() {
    ctx.beginPath();
    ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'blue';  // Different color for bot
    ctx.fill();
    ctx.closePath();
}

// Start game and timer
function startGame() {
    startTime = Date.now();
    botStartTime = Date.now();
    isGameRunning = true;
    gameLoop();
}

// Invite a friend (generate URL with seed)
inviteFriendBtn.addEventListener('click', () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?seed=${levelSeed}`;
    friendUrlInput.value = inviteUrl;
    prompt("Invite your friend using this link:", inviteUrl);
});

// Start race when button is clicked
startRaceBtn.addEventListener('click', () => {
    isPracticeMode = false;
    menu.style.display = 'none';
    gameArea.style.display = 'block';
   
