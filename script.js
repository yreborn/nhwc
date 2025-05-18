// 默认成语库
const defaultIdioms = [
    "一心一意",
    "守株待兔",
    "画蛇添足",
    "掩耳盗铃",
    "对牛弹琴",
    "亡羊补牢",
    "入木三分",
    "望梅止渴",
    "四面楚歌",
    "井底之蛙"
];

// 游戏状态
let gameState = {
    idioms: [...defaultIdioms],
    currentIdiomIndex: 0,
    score: 0,
    timeLeft: 60,
    timerInterval: null,
    isDrawing: false,
    idiomHidden: false
};

// DOM 元素
const startScreen = document.getElementById('start-screen');
const settingsScreen = document.getElementById('settings-screen');
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

const startGameBtn = document.getElementById('start-game');
const settingsBtn = document.getElementById('settings-btn');
const saveSettingsBtn = document.getElementById('save-settings');
const cancelSettingsBtn = document.getElementById('cancel-settings');

const idiomsListTextarea = document.getElementById('idioms-list');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const currentIdiomElement = document.getElementById('current-idiom');
const finalScoreElement = document.getElementById('final-score');

const canvas = document.getElementById('drawing-board');
const ctx = canvas.getContext('2d');
const clearCanvasBtn = document.getElementById('clear-canvas');
const hideIdiomBtn = document.getElementById('hide-idiom');

const guessInput = document.getElementById('guess-input');
const submitGuessBtn = document.getElementById('submit-guess');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const nextBtn = document.getElementById('next-btn');
const playAgainBtn = document.getElementById('play-again');

// 初始化
function init() {
    // 设置默认成语到文本框
    idiomsListTextarea.value = defaultIdioms.join('\\n');
    
    // 设置画布
    setupCanvas();
    
    // 添加事件监听器
    addEventListeners();
}

// 设置画布
function setupCanvas() {
    // 设置画布样式
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#000';
    
    // 清除画布
    clearCanvas();
}

// 清除画布
function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 添加事件监听器
function addEventListeners() {
    // 开始游戏按钮
    startGameBtn.addEventListener('click', startGame);
    
    // 设置按钮
    settingsBtn.addEventListener('click', showSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    cancelSettingsBtn.addEventListener('click', hideSettings);
    
    // 画布事件
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸设备支持
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
    
    // 游戏按钮
    clearCanvasBtn.addEventListener('click', clearCanvas);
    hideIdiomBtn.addEventListener('click', toggleIdiomVisibility);
    submitGuessBtn.addEventListener('click', checkGuess);
    correctBtn.addEventListener('click', handleCorrect);
    wrongBtn.addEventListener('click', handleWrong);
    nextBtn.addEventListener('click', nextIdiom);
    playAgainBtn.addEventListener('click', resetGame);
    
    // 输入框回车提交
    guessInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkGuess();
        }
    });
}

// 处理触摸事件
function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// 开始绘画
function startDrawing(e) {
    gameState.isDrawing = true;
    draw(e);
}

// 绘画
function draw(e) {
    if (!gameState.isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// 停止绘画
function stopDrawing() {
    gameState.isDrawing = false;
    ctx.beginPath();
}

// 显示设置界面
function showSettings() {
    startScreen.classList.remove('active');
    settingsScreen.classList.add('active');
}

// 隐藏设置界面
function hideSettings() {
    settingsScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// 保存设置
function saveSettings() {
    const idiomsList = idiomsListTextarea.value.trim().split('\\n').filter(idiom => idiom.trim() !== '');
    
    if (idiomsList.length < 1) {
        alert('请至少输入一个成语！');
        return;
    }
    
    gameState.idioms = idiomsList;
    hideSettings();
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    gameState.currentIdiomIndex = 0;
    gameState.score = 0;
    gameState.timeLeft = 60;
    gameState.idiomHidden = false;
    
    // 更新UI
    scoreElement.textContent = gameState.score;
    timerElement.textContent = gameState.timeLeft;
    hideIdiomBtn.textContent = '隐藏成语';
    hideIdiomBtn.classList.remove('active');
    
    // 随机打乱成语顺序
    shuffleIdioms();
    
    // 显示第一个成语
    showCurrentIdiom();
    
    // 切换到游戏界面
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    // 开始倒计时
    startTimer();
    
    // 清除画布
    clearCanvas();
    
    // 聚焦到输入框
    guessInput.focus();
}

// 打乱成语顺序
function shuffleIdioms() {
    for (let i = gameState.idioms.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.idioms[i], gameState.idioms[j]] = [gameState.idioms[j], gameState.idioms[i]];
    }
}

// 显示当前成语
function showCurrentIdiom() {
    if (gameState.currentIdiomIndex < gameState.idioms.length) {
        const currentIdiom = gameState.idioms[gameState.currentIdiomIndex];
        if (gameState.idiomHidden) {
            currentIdiomElement.textContent = '*'.repeat(currentIdiom.length);
        } else {
            currentIdiomElement.textContent = currentIdiom;
        }
    } else {
        endGame();
    }
}

// 开始倒计时
function startTimer() {
    // 清除之前的计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerElement.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 10) {
            timerElement.style.color = '#e74c3c';
        }
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// 检查猜测
function checkGuess() {
    const guess = guessInput.value.trim();
    
    if (guess === '') {
        return;
    }
    
    const currentIdiom = gameState.idioms[gameState.currentIdiomIndex];
    
    if (guess === currentIdiom) {
        handleCorrect();
    } else {
        // 可以添加提示或者其他反馈
        guessInput.classList.add('wrong');
        setTimeout(() => {
            guessInput.classList.remove('wrong');
        }, 500);
    }
    
    guessInput.value = '';
    guessInput.focus();
}

// 处理猜对
function handleCorrect() {
    gameState.score++;
    scoreElement.textContent = gameState.score;
    
    // 显示正确动画
    currentIdiomElement.classList.add('correct');
    setTimeout(() => {
        currentIdiomElement.classList.remove('correct');
        nextIdiom();
    }, 1000);
}

// 处理猜错
function handleWrong() {
    // 显示错误动画
    currentIdiomElement.classList.add('wrong');
    setTimeout(() => {
        currentIdiomElement.classList.remove('wrong');
        nextIdiom();
    }, 1000);
}

// 下一个成语
function nextIdiom() {
    gameState.currentIdiomIndex++;
    
    if (gameState.currentIdiomIndex < gameState.idioms.length) {
        // 保持当前的隐藏状态
        showCurrentIdiom();
        clearCanvas();
        guessInput.value = '';
        guessInput.focus();
    } else {
        endGame();
    }
}

// 结束游戏
function endGame() {
    // 清除计时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    // 更新最终得分
    finalScoreElement.textContent = gameState.score;
    
    // 切换到结果界面
    gameScreen.classList.remove('active');
    resultScreen.classList.add('active');
}

// 重置游戏
function resetGame() {
    resultScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// 添加CSS类
document.head.insertAdjacentHTML('beforeend', `
<style>
    .correct {
        animation: correct-animation 1s;
        color: #2ecc71 !important;
    }
    
    .wrong {
        animation: wrong-animation 0.5s;
        color: #e74c3c !important;
    }
    
    @keyframes correct-animation {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes wrong-animation {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-5px); }
        40%, 80% { transform: translateX(5px); }
    }
</style>
`);

// 初始化游戏
window.addEventListener('load', init);
// 切换成语可见性
function toggleIdiomVisibility() {
    gameState.idiomHidden = !gameState.idiomHidden;
    showCurrentIdiom();
    
    // 更新按钮文本
    hideIdiomBtn.textContent = gameState.idiomHidden ? '显示成语' : '隐藏成语';
    hideIdiomBtn.classList.toggle('active', gameState.idiomHidden);
}