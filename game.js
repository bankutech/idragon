const mario = document.getElementById("mario");
const scoreDisplay = document.getElementById("score");
const gameContainer = document.querySelector(".game-container");

// Load sounds
const jumpSound = new Audio("Mario Jump - Gaming Sound Effect (HD).mp3");
const fireSound = new Audio("fire.mp3");
const deathSound = new Audio("Mario Death - Sound Effect (HD).mp3");
const themeMusic = new Audio("Super Mario Bros. Theme Song.mp3");

themeMusic.loop = true;
themeMusic.volume = 0.5;

document.addEventListener("keydown", startMusic);
document.addEventListener("click", startMusic);

function startMusic() {
    themeMusic.play().catch(error => {
        console.log("Autoplay blocked, user interaction needed.");
    });
    document.removeEventListener("keydown", startMusic);
    document.removeEventListener("click", startMusic);
}

let isJumping = false;
let isMovingRight = false;
let isMovingLeft = false;
let bullets = [];
let obstacles = [];
let score = 0;
let gameRunning = true;
let facingRight = true;
let difficultyMultiplier = 1;

function jump() {
    if (!isJumping) {
        isJumping = true;
        jumpSound.currentTime = 0;
        jumpSound.play();
        let jumpSpeed = 15;
        let fallSpeed = 0;
        let currentBottom = parseInt(getComputedStyle(mario).bottom);
        
        let jumpInterval = setInterval(() => {
            if (jumpSpeed > 0) {
                mario.style.bottom = (currentBottom + jumpSpeed) + "px";
                jumpSpeed -= 1;
            } else {
                clearInterval(jumpInterval);
                let fallInterval = setInterval(() => {
                    let newBottom = parseInt(getComputedStyle(mario).bottom);
                    if (newBottom <= 10) {
                        mario.style.bottom = "10px";
                        clearInterval(fallInterval);
                        isJumping = false;
                        score += 10;
                        updateScore();
                    } else {
                        fallSpeed += 1;
                        mario.style.bottom = (newBottom - fallSpeed) + "px";
                    }
                }, 20);
            }
            currentBottom = parseInt(getComputedStyle(mario).bottom);
        }, 20);
    }
}

function shoot() {
    if (!gameRunning) return;
    
    fireSound.currentTime = 0;
    fireSound.play();
    let bullet = document.createElement("div");
    bullet.className = "bullet";
    let marioLeft = parseInt(getComputedStyle(mario).left);
    bullet.style.left = (facingRight ? marioLeft + 50 : marioLeft - 10) + "px";
    bullet.style.bottom = (parseInt(getComputedStyle(mario).bottom) + 25) + "px";
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
    
    let bulletSpeed = facingRight ? 15 : -15;
    let bulletInterval = setInterval(() => {
        if (!gameRunning) {
            clearInterval(bulletInterval);
            return;
        }
        
        let left = parseInt(bullet.style.left);
        bullet.style.left = left + bulletSpeed + "px";
        
        obstacles.forEach((obstacle, index) => {
            const obstacleRect = obstacle.getBoundingClientRect();
            const bulletRect = bullet.getBoundingClientRect();
            
            if (bulletRect.left < obstacleRect.right &&
                bulletRect.right > obstacleRect.left &&
                bulletRect.top < obstacleRect.bottom &&
                bulletRect.bottom > obstacleRect.top) {
                obstacle.remove();
                obstacles.splice(index, 1);
                bullet.remove();
                clearInterval(bulletInterval);
                bullets = bullets.filter(b => b !== bullet);
                score += 20;
                updateScore();
            }
        });
        
        if (left > window.innerWidth || left < 0) {
            clearInterval(bulletInterval);
            bullet.remove();
            bullets = bullets.filter(b => b !== bullet);
        }
    }, 20);
}

function updateScore() {
    scoreDisplay.textContent = score;
    difficultyMultiplier = 1 + score / 100;
}

function gameOver() {
    gameRunning = false;
    deathSound.play();
    alert(`Game Over! Your score: ${score}`);
    location.reload();
}

function handleMovement() {
    if (!gameRunning) return;
    
    let left = parseInt(getComputedStyle(mario).left);
    const containerWidth = gameContainer.offsetWidth;
    
    if (isMovingRight && left < containerWidth - 60) {
        mario.style.left = left + 10 + "px";
    }
    if (isMovingLeft && left > 0) {
        mario.style.left = left - 10 + "px";
    }
    
    checkCollision();
    requestAnimationFrame(handleMovement);
}

function checkCollision() {
    const marioRect = mario.getBoundingClientRect();
    obstacles.forEach(obstacle => {
        const obstacleRect = obstacle.getBoundingClientRect();
        if (
            marioRect.left < obstacleRect.right &&
            marioRect.right > obstacleRect.left &&
            marioRect.top < obstacleRect.bottom &&
            marioRect.bottom > obstacleRect.top
        ) {
            gameOver();
        }
    });
}

document.addEventListener("keydown", (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case "ArrowRight":
            isMovingRight = true;
            facingRight = true;
            mario.style.transform = "scaleX(1)";
            break;
        case "ArrowLeft":
            isMovingLeft = true;
            facingRight = false;
            mario.style.transform = "scaleX(-1)";
            break;
        case " ":
            jump();
            break;
        case "x":
        case "X":
            shoot();
            break;
    }
});

document.addEventListener("keyup", (e) => {
    switch(e.key) {
        case "ArrowRight":
            isMovingRight = false;
            break;
        case "ArrowLeft":
            isMovingLeft = false;
            break;
    }
});

function spawnObstacle() {
    if (!gameRunning) return;
    
    let obstacle = document.createElement("div");
    obstacle.className = "obstacle";
    obstacle.style.left = window.innerWidth + "px";
    obstacle.style.bottom = "10px";
    gameContainer.appendChild(obstacle);
    obstacles.push(obstacle);
    
    let obstacleSpeed = (2 + Math.random() * 6) * difficultyMultiplier;
    let moveObstacle = setInterval(() => {
        if (!gameRunning) {
            clearInterval(moveObstacle);
            return;
        }
        obstacle.style.left = (parseInt(obstacle.style.left) - obstacleSpeed) + "px";
    }, 20);
}
setInterval(spawnObstacle, 2000);
handleMovement();
