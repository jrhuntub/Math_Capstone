const startScreen = document.getElementById('startPage')
const gameContainer = document.getElementById('gameContainer')
const startButton = document.getElementById('startButton')

startButton.addEventListener('click', () => {
    //Hide Start Screen
    startScreen.style.display = 'none'

    //Display Game
    gameContainer.style.display = 'block'
})