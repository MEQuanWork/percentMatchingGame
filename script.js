// --- Game Data ---
const GAME_PAIRS = {
    "25% of 40": "10",
    "50% of 120": "60",
    "10% of 90": "9",
    "20% of 50": "10",
    "75% of 80": "60",
    "1% of 300": "3",
    "40% of 150": "60",
    "30% of 70": "21",
    "15% of 200": "30",
    "60% of 50": "30",
    "25% of 36": "9",
    "200% of 5": "10",
    "0.5% of 1000": "5",
    "90% of 10": "9",
    "12.5% of 80": "10"
};

// --- Team and Game State Variables ---
let cards = [];               
let flippedCards = [];        
let matchedCount = 0;         
let isChecking = false;       
let currentTeamIndex = 0;     
const NUM_TEAMS = 4;

let teams = [
    { name: "Team Alpha", score: 0, moves: 0 },
    { name: "Team Beta", score: 0, moves: 0 },
    { name: "Team Gamma", score: 0, moves: 0 },
    { name: "Team Delta", score: 0, moves: 0 }
];


// --- DOM Elements ---
const gameBoard = document.getElementById('game-board');
const messageElement = document.getElementById('message');
const teamScoreElements = [
    document.getElementById('team-score-1'),
    document.getElementById('team-score-2'),
    document.getElementById('team-score-3'),
    document.getElementById('team-score-4')
];
const resetButton = document.getElementById('reset-button');


// --- Helper Functions ---

window.updateTeamName = (teamNum, newName) => {
    teams[teamNum - 1].name = newName || `Team ${teamNum}`; 
    updateScoreboard();
};

function initializeCards() {
    const cardContents = [];
    for (const [calc, value] of Object.entries(GAME_PAIRS)) {
        cardContents.push({ content: calc, matchValue: value });
        cardContents.push({ content: value, matchValue: calc });
    }
    for (let i = cardContents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardContents[i], cardContents[j]] = [cardContents[j], cardContents[i]];
    }
    cards = cardContents;
}


function renderBoard() {
    gameBoard.innerHTML = ''; 
    cards.forEach((cardData, index) => {
        
        const cardNumber = index + 1; 
        
        const container = document.createElement('div');
        container.classList.add('card-container');
        container.dataset.index = index;
        
        const card = document.createElement('div');
        card.classList.add('card');

        const front = document.createElement('div');
        front.classList.add('card-face', 'card-front');
        front.innerHTML = cardData.content;
        
        const back = document.createElement('div');
        back.classList.add('card-face', 'card-back');
        back.innerHTML = cardNumber; 

        card.appendChild(front);
        card.appendChild(back);
        container.appendChild(card);
        
        container.addEventListener('click', () => handleCardClick(container, index));
        gameBoard.appendChild(container);
    });
}


function handleCardClick(cardContainer, index) {
    const cardElement = cardContainer.querySelector('.card');

    if (isChecking || 
        cardElement.classList.contains('flipped') || 
        cardContainer.classList.contains('matched') ||
        flippedCards.length === 2) {
        return;
    }

    cardElement.classList.add('flipped');
    flippedCards.push({ index, container: cardContainer, data: cards[index] });

    if (flippedCards.length === 2) {
        isChecking = true;
        checkMatch();
    }
}


function checkMatch() {
    const [card1, card2] = flippedCards;
    const currentTeam = teams[currentTeamIndex];
    let isMatch = false;

    if (card1.data.content === card2.data.matchValue && card2.data.content === card1.data.matchValue) {
        isMatch = true;
    }

    currentTeam.moves++;

    if (isMatch) {
        messageElement.textContent = `🎉 MATCH for ${currentTeam.name}! They get another turn. 🎉`;
        
        // This applies opacity: 0.5 via CSS
        card1.container.classList.add('matched');
        card2.container.classList.add('matched');
        
        currentTeam.score++;
        matchedCount++;

        if (matchedCount === Object.keys(GAME_PAIRS).length) {
            setTimeout(() => {
                let winner = teams.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                messageElement.innerHTML = `<h3>🏆 GAME OVER! ${winner.name} wins with ${winner.score} pairs! 🏆</h3>`;
            }, 600);
        }

        flippedCards = [];
        isChecking = false;

    } else {
        messageElement.textContent = `❌ No Match! ${currentTeam.name}'s turn is over. ❌`;
        
        setTimeout(() => {
            card1.container.querySelector('.card').classList.remove('flipped');
            card2.container.querySelector('.card').classList.remove('flipped');
            
            currentTeamIndex = (currentTeamIndex + 1) % NUM_TEAMS;
            
            flippedCards = [];
            isChecking = false;
            
            updateScoreboard();
            messageElement.textContent += ` It's now ${teams[currentTeamIndex].name}'s turn!`;
        }, 1200);
    }
    updateScoreboard();
}

function updateScoreboard() {
    teamScoreElements.forEach((element, index) => {
        const team = teams[index];
        element.innerHTML = `
            <strong>${team.name}</strong><br>
            Pairs: ${team.score}<br>
            Moves: ${team.moves}
        `;
        element.classList.remove('active-team');
        if (index === currentTeamIndex && matchedCount < Object.keys(GAME_PAIRS).length) {
            element.classList.add('active-team');
        }
    });
}


function startGame() {
    // Reset state
    flippedCards = [];
    matchedCount = 0;
    currentTeamIndex = 0;
    isChecking = false;
    
    teams.forEach(team => {
        team.score = 0;
        team.moves = 0;
    });
    
    document.getElementById('team-name-1').value = teams[0].name;
    document.getElementById('team-name-2').value = teams[1].name;
    document.getElementById('team-name-3').value = teams[2].name;
    document.getElementById('team-name-4').value = teams[3].name;

    messageElement.textContent = `It's ${teams[currentTeamIndex].name}'s turn! Pick a card to start.`;
    
    initializeCards();
    renderBoard();
    updateScoreboard();
}

// --- Event Listeners ---
resetButton.addEventListener('click', startGame);


// --- Start the game on page load ---
startGame();