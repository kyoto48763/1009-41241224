let flipCount = 0;
let flippedCards = [];
let lockBoard = false;
let matchedCards = 0;
let imageSet = 'image'; // 預設圖片集資料夾
let gameTime = 0; // 用來記錄遊戲時間
let gameTimer = null; // 儲存計時器

const backImagesSet1 = [
    'item1.png', 'item2.png', 'item3.png', 'item4.png', 
    'item5.png', 'item6.png', 'item7.png', 'item8.png', 
    'item19.png', 'item10.png', 'item11.png', 'item12.png', 
    'item13.png', 'item14.png', 'item15.png', 'item16.png', 
    'item17.png', 'item18.png'
];

const backImagesSet2 = [
    'item1.jpg', 'item2.jpg', 'item3.jpg', 'item4.jpg', 
    'item5.jpg', 'item6.jpg', 'item7.jpg', 'item8.jpg', 
    'item19.jpg', 'item10.jpg', 'item11.jpg', 'item12.jpg', 
    'item13.jpg', 'item14.jpg', 'item15.jpg', 'item16.jpg', 
    'item17.jpg', 'item18.jpg'
];

let backImages = [...backImagesSet1]; // 初始設定為第一個圖片集
const frontImageSet1 = 'item9.jpg'; // 使用 item9 作為正面圖片
const frontImageSet2 = 'item9.jpg'; // 使用 item9 作為正面圖片
let frontImage = `${imageSet}/${frontImageSet1}`; // 預設統一背面圖片
let cards = [];
const cardContainer = document.getElementById('card-container');
const flipCountDisplay = document.getElementById('flip-count');
const gameTimeDisplay = document.getElementById('game-time');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const toggleImagesBtn = document.getElementById('toggle-images-btn');
const gridSizeSelect = document.getElementById('grid-size-select');

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
toggleImagesBtn.addEventListener('click', toggleImageSet);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function generateCards() {
    const gridSize = parseInt(gridSizeSelect.value);
    const numPairs = (gridSize * gridSize) / 2; // 計算需要多少對圖片

    // 根據網格大小確定需要的卡片數量
    cards = [...backImages.slice(0, numPairs), ...backImages.slice(0, numPairs)]; // 每張背面圖片各兩張
    shuffle(cards);
    cardContainer.innerHTML = ''; // 清空卡片容器

    // 設定網格佈局
    cardContainer.style.gridTemplateColumns = `repeat(${gridSize}, 100px)`;
    cardContainer.style.gridTemplateRows = `repeat(${gridSize}, 140px)`;

    cards.forEach((image, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-inner" id="card-inner-${index}" onclick="flipCard(${index})">
                <div class="card-back">
                    <img src="${imageSet}/${image}" alt="背面圖片">
                </div>
                <div class="card-front">
                    <img src="${frontImage}" alt="正面圖片"> <!-- 使用 item9 作為正面圖片 -->
                </div>
            </div>
        `;
        cardContainer.appendChild(card);
    });
}

function startGame() {
    flipCount = 0;
    flippedCards = [];
    lockBoard = true;  // 防止在倒數期間翻卡
    matchedCards = 0;
    gameTime = 0;  // 重置遊戲時間
    flipCountDisplay.textContent = flipCount;
    gameTimeDisplay.textContent = gameTime;
    cardContainer.style.display = 'grid';
    startBtn.style.display = 'none';
    resetBtn.style.display = 'block';
    generateCards();

    const countdownSelect = document.getElementById('countdown-select');
    let countdownTime = parseInt(countdownSelect.value) * 1000;

    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        gameTime++;
        gameTimeDisplay.textContent = gameTime;
    }, 1000);

    setTimeout(flipAllCardsToFront, 100);

    setTimeout(() => {
        flipAllCardsToBack();
        lockBoard = false;
    }, countdownTime);
}

function resetGame() {
    flipCount = 0;
    flippedCards = [];
    lockBoard = true;  
    matchedCards = 0;
    gameTime = 0;
    flipCountDisplay.textContent = flipCount;
    gameTimeDisplay.textContent = gameTime;
    clearInterval(gameTimer);

    gameTimer = setInterval(() => {
        gameTime++;
        gameTimeDisplay.textContent = gameTime;
    }, 1000);

    generateCards();

    setTimeout(flipAllCardsToFront, 100);

    const countdownSelect = document.getElementById('countdown-select');
    let countdownTime = parseInt(countdownSelect.value) * 1000;
    setTimeout(() => {
        flipAllCardsToBack();
        lockBoard = false;
    }, countdownTime);
}

function flipCard(index) {
    if (lockBoard) return;
    const cardInner = document.getElementById(`card-inner-${index}`);
    if (cardInner.style.transform !== 'rotateY(180deg)') {
        cardInner.style.transform = 'rotateY(180deg)';
        flippedCards.push(index);
        
        if (flippedCards.length === 2) {
            flipCount++;
            flipCountDisplay.textContent = flipCount;
            lockBoard = true;
            setTimeout(checkMatch, 1000);
        }
    }
}

function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    const firstImage = document.getElementById(`card-inner-${firstCard}`).querySelector('.card-back img').src;
    const secondImage = document.getElementById(`card-inner-${secondCard}`).querySelector('.card-back img').src;
    
    const hideCompletedCheckbox = document.getElementById('hide-completed');
    const successSound = document.getElementById('success-sound');
    const failureSound = document.getElementById('failure-sound');

    if (firstImage === secondImage) {
        matchedCards++;
        if (hideCompletedCheckbox.checked) {
            document.querySelectorAll('.card-inner')[firstCard].style.visibility = 'hidden';
            document.querySelectorAll('.card-inner')[secondCard].style.visibility = 'hidden';
        }
        successSound.currentTime = 0; // 重置音效播放位置
        successSound.play();
    } else {
        failureSound.currentTime = 0; // 重置音效播放位置
        failureSound.play();
        const firstCardInner = document.getElementById(`card-inner-${firstCard}`);
        const secondCardInner = document.getElementById(`card-inner-${secondCard}`);
        firstCardInner.style.transform = 'rotateY(0deg)';
        secondCardInner.style.transform = 'rotateY(0deg)';
    }

    flippedCards = [];
    lockBoard = false;

    // 檢查是否所有卡片都已匹配
    if (matchedCards === (cards.length / 2)) {
        clearInterval(gameTimer);
        alert(`遊戲結束！總翻牌次數: ${flipCount}`);
        resetGame(); // 自動重置遊戲
    }
}

function flipAllCardsToFront() {
    const allCards = document.querySelectorAll('.card-inner');
    allCards.forEach(card => {
        card.style.transform = 'rotateY(180deg)';
    });
}

function flipAllCardsToBack() {
    const allCards = document.querySelectorAll('.card-inner');
    allCards.forEach(card => {
        card.style.transform = 'rotateY(0deg)';
    });
}

function toggleImageSet() {
    if (imageSet === 'image') {
        imageSet = 'image2'; // 切換到第二個圖片集
        backImages = [...backImagesSet2];
    } else {
        imageSet = 'image'; // 切換回第一個圖片集
        backImages = [...backImagesSet1];
    }
    frontImage = `${imageSet}/${frontImageSet1}`; // 更新正面圖片
    resetGame();
}
