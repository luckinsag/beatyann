class Game {
    constructor() {
        this.score = 0;
        this.gameArea = document.getElementById('game-area');
        this.scoreElement = document.getElementById('score');
        this.hitSound = document.getElementById('hit-sound');
        this.maxTargets = 5;
        this.activeTargets = new Set();
        
        this.init();
    }

    init() {
        this.spawnTarget();
        setInterval(() => this.spawnTarget(), 1000);
    }

    spawnTarget() {
        if (this.activeTargets.size >= this.maxTargets) return;

        const target = document.createElement('div');
        target.className = 'target';
        
        // 设置随机位置
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        
        target.style.left = `${x}px`;
        target.style.top = `${y}px`;
        
        // 添加头像图片
        const img = document.createElement('img');
        img.src = 'avatar.png'; // 需要添加杨尚玮的卡通头像
        target.appendChild(img);

        // 添加点击事件
        target.addEventListener('click', () => this.hitTarget(target));
        
        this.gameArea.appendChild(target);
        this.activeTargets.add(target);
        
        // 设置自动消失
        setTimeout(() => {
            if (this.gameArea.contains(target)) {
                this.gameArea.removeChild(target);
                this.activeTargets.delete(target);
            }
        }, 2000);
    }

    hitTarget(target) {
        this.score += 1;
        this.scoreElement.textContent = this.score;
        
        // 播放音效
        this.hitSound.currentTime = 0;
        this.hitSound.play();
        
        // 创建爆炸效果
        this.createExplosion(target);
        
        // 移除目标
        this.gameArea.removeChild(target);
        this.activeTargets.delete(target);
    }

    createExplosion(target) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = target.style.left;
        explosion.style.top = target.style.top;
        
        // 添加爆炸图片
        const img = document.createElement('img');
        img.src = 'explosion.png'; // 需要添加爆炸效果图片
        explosion.appendChild(img);
        
        this.gameArea.appendChild(explosion);
        
        // 动画结束后移除爆炸效果
        setTimeout(() => {
            if (this.gameArea.contains(explosion)) {
                this.gameArea.removeChild(explosion);
            }
        }, 500);
    }
}

// 启动游戏
window.onload = () => {
    new Game();
}; 