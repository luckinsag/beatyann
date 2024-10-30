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

        const target = document.createElement('div');
        target.className = 'target';
        
        // 根据关卡选择不同的运动方式
        if (this.currentConfig.movePattern === 'random') {
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
        img.src = 'avatar.png';
        target.appendChild(img);

        target.addEventListener('click', (e) => this.hitTarget(target));
        target.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.hitTarget(target);
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

    removeTarget(target) {
        this.animations.delete(target);
        if (this.gameArea.contains(target)) {
            this.gameArea.removeChild(target);
            this.activeTargets.delete(target);
        }
    }

    hitTarget(target) {
        this.score += 1;
        this.scoreElement.textContent = this.score;
        
        // 检查是否需要升级
        const nextLevel = this.level + 1;
        if (this.score >= this.currentConfig.scoreToNext && this.levelConfigs[nextLevel]) {
            this.updateLevel(nextLevel);
        }
        
        this.hitSound.currentTime = 0;
        this.hitSound.play();
        
        this.createExplosion(target);
        this.removeTarget(target);
    }

    createExplosion(target) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = target.style.left;
        explosion.style.top = target.style.top;
        
        const img = document.createElement('img');
        img.src = 'explosion.png';
        explosion.appendChild(img);
        
        this.gameArea.appendChild(explosion);
        
        setTimeout(() => {
            if (this.gameArea.contains(explosion)) {
                this.gameArea.removeChild(explosion);
            }
        }, 500);
    }
}

let game; // 添加全局变量

window.onload = () => {
    game = new Game(); // 将game实例赋值给全局变量
}; 