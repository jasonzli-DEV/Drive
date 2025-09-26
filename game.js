class DriveGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
        
        // Game settings
        this.lanes = 4;
        this.laneWidth = this.canvas.width / this.lanes;
        this.playerLane = 1; // 0-3, starting in second lane
        this.playerSpeed = 0;
        this.baseSpeed = 2;
        this.maxSpeed = 8;
        this.speedIncrease = 0.002;
        
        // Game objects
        this.player = {
            x: this.laneWidth * this.playerLane + this.laneWidth / 2 - 25,
            y: this.canvas.height - 100,
            width: 50,
            height: 80,
            lane: this.playerLane
        };
        
        this.obstacles = [];
        this.gems = [];
        this.bombs = [];
        this.roadMarkings = [];
        
        // Game state
        this.score = 0;
        this.gemsCount = 0;
        this.revives = 0;
        this.gameSpeed = this.baseSpeed;
        this.roadOffset = 0;
        
        // Input handling
        this.keys = {};
        this.lastLaneChange = 0;
        
        this.initializeEvents();
        this.initializeRoad();
        this.gameLoop();
    }
    
    initializeEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            this.handleKeyPress(e.key);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Button events
        document.getElementById('startButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.showMenu();
        });
        
        document.getElementById('reviveButton').addEventListener('click', () => {
            this.useRevive();
        });
    }
    
    initializeRoad() {
        // Create road markings
        for (let i = 0; i < 20; i++) {
            this.roadMarkings.push({
                x: this.laneWidth,
                y: i * 60,
                width: 4,
                height: 30
            });
            this.roadMarkings.push({
                x: this.laneWidth * 2,
                y: i * 60,
                width: 4,
                height: 30
            });
            this.roadMarkings.push({
                x: this.laneWidth * 3,
                y: i * 60,
                width: 4,
                height: 30
            });
        }
    }
    
    handleKeyPress(key) {
        if (this.gameState !== 'playing') return;
        
        const now = Date.now();
        if (now - this.lastLaneChange < 200) return; // Prevent rapid lane changes
        
        if (key === 'ArrowLeft' && this.playerLane > 0) {
            this.playerLane--;
            this.lastLaneChange = now;
        } else if (key === 'ArrowRight' && this.playerLane < 3) {
            this.playerLane++;
            this.lastLaneChange = now;
        }
        
        this.player.lane = this.playerLane;
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gemsCount = 0;
        this.revives = Math.floor(this.gemsCount / 10);
        this.gameSpeed = this.baseSpeed;
        this.playerLane = 1;
        
        // Reset game objects
        this.obstacles = [];
        this.gems = [];
        this.bombs = [];
        
        // Reset player position
        this.player.lane = this.playerLane;
        this.player.x = this.laneWidth * this.playerLane + this.laneWidth / 2 - 25;
        
        this.hideAllScreens();
        this.updateUI();
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.hideAllScreens();
        document.getElementById('menu').classList.remove('hidden');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.hideAllScreens();
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
        
        // Check if player can revive
        if (this.gemsCount >= 10) {
            document.getElementById('reviveOption').classList.remove('hidden');
            document.getElementById('reviveButton').classList.remove('hidden');
        } else {
            document.getElementById('reviveOption').classList.add('hidden');
            document.getElementById('reviveButton').classList.add('hidden');
        }
        
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    useRevive() {
        if (this.gemsCount >= 10) {
            this.gemsCount -= 10;
            this.revives = Math.floor(this.gemsCount / 10);
            this.startGame();
        }
    }
    
    hideAllScreens() {
        document.getElementById('menu').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        document.getElementById('gems').textContent = `Gems: ${this.gemsCount}`;
        document.getElementById('revives').textContent = `Revives: ${Math.floor(this.gemsCount / 10)}`;
    }
    
    spawnObstacle() {
        if (Math.random() < 0.02) {
            const lane = Math.floor(Math.random() * 4);
            const isMovingUp = lane < 2; // Left lanes move toward user
            
            this.obstacles.push({
                x: this.laneWidth * lane + this.laneWidth / 2 - 25,
                y: isMovingUp ? this.canvas.height + 50 : -50,
                width: 50,
                height: 80,
                lane: lane,
                speed: isMovingUp ? -(this.gameSpeed + 2) : this.gameSpeed + 1,
                color: isMovingUp ? '#ff6b6b' : '#4a90e2'
            });
        }
    }
    
    spawnGem() {
        if (Math.random() < 0.008) {
            const lane = Math.floor(Math.random() * 4);
            this.gems.push({
                x: this.laneWidth * lane + this.laneWidth / 2 - 10,
                y: -20,
                width: 20,
                height: 20,
                lane: lane,
                speed: this.gameSpeed
            });
        }
    }
    
    spawnBomb() {
        if (Math.random() < 0.005) {
            const lane = Math.floor(Math.random() * 4);
            this.bombs.push({
                x: this.laneWidth * lane + this.laneWidth / 2 - 15,
                y: -30,
                width: 30,
                height: 30,
                lane: lane,
                speed: this.gameSpeed
            });
        }
    }
    
    updateGameObjects() {
        // Update player position (smooth lane changing)
        const targetX = this.laneWidth * this.playerLane + this.laneWidth / 2 - 25;
        this.player.x += (targetX - this.player.x) * 0.15;
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += obstacle.speed;
            
            // Remove obstacles that are off screen
            if (obstacle.y > this.canvas.height + 100 || obstacle.y < -100) {
                this.obstacles.splice(index, 1);
            }
        });
        
        // Update gems
        this.gems.forEach((gem, index) => {
            gem.y += gem.speed;
            
            if (gem.y > this.canvas.height + 50) {
                this.gems.splice(index, 1);
            }
        });
        
        // Update bombs
        this.bombs.forEach((bomb, index) => {
            bomb.y += bomb.speed;
            
            if (bomb.y > this.canvas.height + 50) {
                this.bombs.splice(index, 1);
            }
        });
        
        // Update road markings
        this.roadOffset += this.gameSpeed;
        this.roadMarkings.forEach(marking => {
            marking.y += this.gameSpeed;
            if (marking.y > this.canvas.height) {
                marking.y = -30;
            }
        });
        
        // Increase game speed gradually
        this.gameSpeed = Math.min(this.maxSpeed, this.gameSpeed + this.speedIncrease);
    }
    
    checkCollisions() {
        // Check obstacle collisions
        this.obstacles.forEach((obstacle, index) => {
            if (this.isColliding(this.player, obstacle)) {
                this.gameOver();
                return;
            }
        });
        
        // Check gem collisions
        this.gems.forEach((gem, index) => {
            if (this.isColliding(this.player, gem)) {
                this.gemsCount++;
                this.score += 10;
                this.gems.splice(index, 1);
            }
        });
        
        // Check bomb collisions
        this.bombs.forEach((bomb, index) => {
            if (this.isColliding(this.player, bomb)) {
                this.gameOver();
                return;
            }
        });
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road background
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lane dividers
        this.ctx.fillStyle = '#666';
        for (let i = 1; i < this.lanes; i++) {
            this.ctx.fillRect(i * this.laneWidth - 2, 0, 4, this.canvas.height);
        }
        
        // Draw road markings
        this.ctx.fillStyle = '#fff';
        this.roadMarkings.forEach(marking => {
            this.ctx.fillRect(marking.x, marking.y, marking.width, marking.height);
        });
        
        // Draw player car
        this.ctx.fillStyle = '#50c878';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x + 10, this.player.y + 10, 10, 15);
        this.ctx.fillRect(this.player.x + 30, this.player.y + 10, 10, 15);
        this.ctx.fillRect(this.player.x + 10, this.player.y + 55, 10, 15);
        this.ctx.fillRect(this.player.x + 30, this.player.y + 55, 10, 15);
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = obstacle.color;
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // Add simple car details
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(obstacle.x + 10, obstacle.y + 10, 8, 12);
            this.ctx.fillRect(obstacle.x + 32, obstacle.y + 10, 8, 12);
            this.ctx.fillRect(obstacle.x + 10, obstacle.y + 58, 8, 12);
            this.ctx.fillRect(obstacle.x + 32, obstacle.y + 58, 8, 12);
        });
        
        // Draw gems
        this.ctx.fillStyle = '#ffd700';
        this.gems.forEach(gem => {
            this.ctx.beginPath();
            this.ctx.arc(gem.x + gem.width / 2, gem.y + gem.height / 2, gem.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add sparkle effect
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(gem.x + gem.width / 2 - 1, gem.y + 5, 2, 10);
            this.ctx.fillRect(gem.x + 5, gem.y + gem.height / 2 - 1, 10, 2);
        });
        
        // Draw bombs
        this.ctx.fillStyle = '#333';
        this.bombs.forEach(bomb => {
            this.ctx.beginPath();
            this.ctx.arc(bomb.x + bomb.width / 2, bomb.y + bomb.height / 2, bomb.width / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add bomb details
            this.ctx.fillStyle = '#ff4444';
            this.ctx.fillRect(bomb.x + bomb.width / 2 - 2, bomb.y + 5, 4, 8);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(bomb.x + bomb.width / 2 - 1, bomb.y + 7, 2, 4);
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.spawnObstacle();
        this.spawnGem();
        this.spawnBomb();
        this.updateGameObjects();
        this.checkCollisions();
        
        // Update score
        this.score += 1;
        this.updateUI();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DriveGame();
});