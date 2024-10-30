class Game {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.hitSound = document.getElementById('hit-sound');
        this.maxTargets = 5;
        this.activeTargets = new Set();
        this.animations = new Map();
        
        this.levelConfigs = {
            1: {
                maxTargets: 3,
                spawnInterval: 1500,
                movePattern: 'linear',    // 直线运动
                targetSpeed: 2,
                scoreToNext: 10
            },
            2: {
                maxTargets: 4,
                spawnInterval: 1200,
                movePattern: 'parabola',  // 抛物线运动
                targetSpeed: 3,
                scoreToNext: 25
            },
            3: {
                maxTargets: 5,
                spawnInterval: 1000,
                movePattern: 'zigzag',    // 之字形运动
                targetSpeed: 4,
                scoreToNext: Infinity
            },
            4: {  // 随机关卡
                maxTargets: 6,
                spawnInterval: 800,
                movePattern: 'random',
                targetSpeed: 5,
                scoreToNext: Infinity
            }
        };
        
        this.init();
        
        // 添加触摸事件支持
        this.gameArea.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 防止默认行为
        }, { passive: false });
        
        // 增加特殊目标的概率和数量
        this.bombProbability = 0.3; // 增加到30%的概率
        this.maxBombs = 3; // 最多同时存在3个特殊目标
        
        // 添加打地鼠模式的位置配置
        this.molePositions = [
            { x: '20%', y: '20%' },
            { x: '50%', y: '20%' },
            { x: '80%', y: '20%' },
            { x: '20%', y: '50%' },
            { x: '50%', y: '50%' },
            { x: '80%', y: '50%' },
            { x: '20%', y: '80%' },
            { x: '50%', y: '80%' },
            { x: '80%', y: '80%' }
        ];
    }

    init() {
        this.updateLevel(1);
        this.spawnInterval = setInterval(() => this.spawnTarget(), this.currentConfig.spawnInterval);
    }

    updateLevel(level) {
        this.level = level;
        this.currentConfig = this.levelConfigs[level];
        this.maxTargets = this.currentConfig.maxTargets;
        if (this.levelElement) {
            this.levelElement.textContent = level;
        }
        
        // 清除当前所有目标
        this.activeTargets.forEach(target => {
            if (this.gameArea.contains(target)) {
                this.gameArea.removeChild(target);
            }
        });
        this.activeTargets.clear();
        this.animations.clear();
        
        // 更新生成间隔
        if (this.spawnInterval) {
            clearInterval(this.spawnInterval);
        }
        this.spawnInterval = setInterval(() => this.spawnTarget(), this.currentConfig.spawnInterval);
    }

    spawnTarget() {
        if (this.activeTargets.size >= this.maxTargets) return;

        // 计算当前特殊目标的数量
        const currentBombs = Array.from(this.activeTargets)
            .filter(target => target.classList.contains('bomb')).length;

        // 决定是否生成特殊目标
        const isBomb = currentBombs < this.maxBombs && Math.random() < this.bombProbability;
        
        const target = document.createElement('div');
        target.className = isBomb ? 'target bomb' : 'target';
        
        // 根据关卡选择不同的运动方式
        if (this.level === 1) {
            // 打地鼠模式
            this.moveMole(target);
        } else if (this.currentConfig.movePattern === 'random') {
            // 随机选择一种运动方式
            const patterns = ['linear', 'parabola', 'zigzag', 'spiral', 'bounce'];
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            switch (randomPattern) {
                case 'linear':
                    this.moveLinear(target);
                    break;
                case 'parabola':
                    this.moveParabola(target);
                    break;
                case 'zigzag':
                    this.moveZigzag(target);
                    break;
                case 'spiral':
                    this.moveSpiral(target);
                    break;
                case 'bounce':
                    this.moveBounce(target);
                    break;
            }
        } else {
            // 原有的运动方式选择逻辑
            switch (this.currentConfig.movePattern) {
                case 'linear':
                    this.moveLinear(target);
                    break;
                case 'parabola':
                    this.moveParabola(target);
                    break;
                case 'zigzag':
                    this.moveZigzag(target);
                    break;
            }
        }
        
        // 添加头像图片
        const img = document.createElement('img');
        img.src = isBomb ? 'bomb.png' : 'avatar.png'; // 需要准备一个bomb.png图片
        target.appendChild(img);

        target.addEventListener('click', (e) => this.hitTarget(target, isBomb));
        target.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hitTarget(target, isBomb);
        }, { passive: false });
        
        this.gameArea.appendChild(target);
        this.activeTargets.add(target);
    }

    moveLinear(target) {
        const targetSize = window.innerWidth <= 768 ? 60 : 100; // 根据屏幕宽度调整大小
        const startX = -targetSize;
        const startY = Math.random() * (window.innerHeight - targetSize);
        target.style.left = `${startX}px`;
        target.style.top = `${startY}px`;

        const animate = () => {
            const currentX = parseFloat(target.style.left);
            if (currentX > window.innerWidth) {
                this.removeTarget(target);
                return;
            }
            target.style.left = `${currentX + this.currentConfig.targetSpeed}px`;
            if (this.animations.has(target)) {
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(target, animate);
        requestAnimationFrame(animate);
    }

    moveParabola(target) {
        const targetSize = window.innerWidth <= 768 ? 60 : 100;
        const startX = -targetSize;
        const endX = window.innerWidth + targetSize;
        const maxHeight = window.innerHeight * 0.6;
        const startTime = Date.now();
        const duration = 3000;

        target.style.left = `${startX}px`;
        target.style.top = `${window.innerHeight - 100}px`;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.removeTarget(target);
                return;
            }

            const currentX = startX + (endX - startX) * progress;
            const verticalProgress = progress * 2 - 1;
            const currentY = window.innerHeight - 100 - maxHeight * (1 - verticalProgress * verticalProgress);

            target.style.left = `${currentX}px`;
            target.style.top = `${currentY}px`;

            if (this.animations.has(target)) {
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(target, animate);
        requestAnimationFrame(animate);
    }

    moveZigzag(target) {
        const targetSize = window.innerWidth <= 768 ? 60 : 100;
        const startX = -targetSize;
        const amplitude = 100; // 之字形的振幅
        const frequency = 0.01; // 之字形的频率
        let time = 0;

        target.style.left = `${startX}px`;
        target.style.top = `${window.innerHeight / 2}px`;

        const animate = () => {
            const currentX = parseFloat(target.style.left);
            if (currentX > window.innerWidth) {
                this.removeTarget(target);
                return;
            }

            time += 0.016; // 大约每帧16ms
            const currentY = window.innerHeight / 2 + Math.sin(time * frequency * 1000) * amplitude;

            target.style.left = `${currentX + this.currentConfig.targetSpeed}px`;
            target.style.top = `${currentY}px`;

            if (this.animations.has(target)) {
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(target, animate);
        requestAnimationFrame(animate);
    }

    moveSpiral(target) {
        const targetSize = window.innerWidth <= 768 ? 60 : 100;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        let angle = 0;
        let radius = 0;
        const maxRadius = Math.min(window.innerWidth, window.innerHeight) / 3;
        
        target.style.left = `${centerX}px`;
        target.style.top = `${centerY}px`;

        const animate = () => {
            angle += 0.05;
            radius += 0.5;
            
            if (radius > maxRadius) {
                this.removeTarget(target);
                return;
            }

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            target.style.left = `${x}px`;
            target.style.top = `${y}px`;

            if (this.animations.has(target)) {
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(target, animate);
        requestAnimationFrame(animate);
    }

    moveBounce(target) {
        const targetSize = window.innerWidth <= 768 ? 60 : 100;
        let x = Math.random() * (window.innerWidth - targetSize);
        let y = 0;
        let speedX = (Math.random() - 0.5) * 10;
        let speedY = 0;
        const gravity = 0.5;
        const bounce = -0.7;
        
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;

        const animate = () => {
            speedY += gravity;
            x += speedX;
            y += speedY;

            // 碰到边界反弹
            if (x <= 0 || x >= window.innerWidth - targetSize) {
                speedX *= -1;
                x = x <= 0 ? 0 : window.innerWidth - targetSize;
            }
            
            if (y >= window.innerHeight - targetSize) {
                speedY *= bounce;
                y = window.innerHeight - targetSize;
            }

            // 当弹跳高度很小时移除目标
            if (Math.abs(speedY) < 0.1 && y >= window.innerHeight - targetSize - 1) {
                this.removeTarget(target);
                return;
            }

            target.style.left = `${x}px`;
            target.style.top = `${y}px`;

            if (this.animations.has(target)) {
                requestAnimationFrame(animate);
            }
        };

        this.animations.set(target, animate);
        requestAnimationFrame(animate);
    }

    moveMole(target) {
        // 随机选择一个位置
        const position = this.molePositions[Math.floor(Math.random() * this.molePositions.length)];
        
        // 设置初始位置（从下方出现）
        target.style.left = position.x;
        target.style.top = '100%';
        
        // 添加动画类
        target.classList.add('mole-animation');
        
        // 设置最终位置
        setTimeout(() => {
            target.style.top = position.y;
        }, 50);

        // 设置消失时间
        setTimeout(() => {
            if (this.gameArea.contains(target)) {
                // 添加消失动画
                target.style.top = '100%';
                setTimeout(() => {
                    this.removeTarget(target);
                }, 300);
            }
        }, 2000);
    }

    removeTarget(target) {
        this.animations.delete(target);
        if (this.gameArea.contains(target)) {
            this.gameArea.removeChild(target);
            this.activeTargets.delete(target);
        }
    }

    hitTarget(target, isBomb) {
        if (isBomb) {
            this.gameOver();
            return;
        }
        
        // 原有的hitTarget逻辑
        this.score += 1;
        this.scoreElement.textContent = this.score;
        
        this.hitSound.currentTime = 0;
        this.hitSound.play();
        
        this.createExplosion(target);
        this.removeTarget(target);
    }

    createExplosion(target) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        
        // 获取目标的位置和大小
        const targetRect = target.getBoundingClientRect();
        const centerX = targetRect.left + targetRect.width / 2;
        const centerY = targetRect.top + targetRect.height / 2;
        
        // 设置爆炸效果的位置（居中）
        explosion.style.left = `${centerX}px`;
        explosion.style.top = `${centerY}px`;
        
        const img = document.createElement('img');
        img.src = 'explosion.png';
        explosion.appendChild(img);
        
        this.gameArea.appendChild(explosion);
        
        setTimeout(() => {
            if (this.gameArea.contains(explosion)) {
                this.gameArea.removeChild(explosion);
            }
        }, 300);  // 与动画时间匹配
    }

    gameOver() {
        // 停止游戏
        this.isGameActive = false;
        clearInterval(this.spawnInterval);
        
        // 创建游戏结束界面
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.innerHTML = `
            <div class="game-over-card">
                <h2>GAME OVER</h2>
                <p>FINAL SCORE: ${this.score}</p>
                <button class="pixel-button" onclick="game.restart()">RESTART</button>
            </div>
        `;
        
        this.gameArea.appendChild(gameOverScreen);
        
        // 清除所有目标
        this.activeTargets.forEach(target => {
            if (this.gameArea.contains(target)) {
                this.gameArea.removeChild(target);
            }
        });
        this.activeTargets.clear();
        this.animations.clear();
    }

    restart() {
        // 移除游戏结束界面
        const gameOverScreen = document.querySelector('.game-over');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
        
        // 重置游戏状态
        this.score = 0;
        this.scoreElement.textContent = '0';
        this.isGameActive = true;
        
        // 重新开始当前关卡
        this.updateLevel(this.level);
    }
}

let game; // 添加全局变量

window.onload = () => {
    game = new Game(); // 将game实例赋值给全局变量
}; 