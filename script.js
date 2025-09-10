const startScreen = document.getElementById('startPage')
const gameContainer = document.getElementById('gameContainer')
const startButton = document.getElementById('startButton')

startButton.addEventListener('click', () => {
    //Hide Start Screen
    startScreen.style.display = 'none'

    //Display Game
    gameContainer.style.display = 'block'

    //Start New Problem
    generateSimpleProblem()
})

function generateSimpleProblem() {
    //Generate 2 Random Numbers
    let num1 = Math.floor(Math.random() * 10) + 1
    let num2 = Math.floor(Math.random() * 10) + 1

    let operation = ""
    if (num1 > 0 && num1 <= 3) {
        operation = "+"
    }
    else if (num1 > 3 && num1 <= 7) {
        operation = "-"
    }
    else {
        operation = "*"
    }

    let question;
    let answer;
    
    if (operation === "+") {
        question = `${num1} + ${num2}`
        answer = num1 + num2
    }
    else if (operation === "-") {
        question = `${num1} - ${num2}`
        answer = num1 - num2
    }
    else {
        question = `${num1} * ${num2}`
        answer = num1*num2
    }

    return {
        question: question,
        answer: answer
    }

}

const problemText = document.getElementById('problemTxt');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-btn');