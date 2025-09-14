const startScreen = document.getElementById('startPage')
const gameContainer = document.getElementById('gameContainer')
const startButton = document.getElementById('startButton')

const problemText = document.getElementById('problemTxt');
const answerInput = document.getElementById('answer-input');
const submitButton = document.getElementById('submit-btn');

let currentProblem

startButton.addEventListener('click', () => {
    //Hide Start Screen
    startScreen.style.display = 'none'

    //Display Game
    gameContainer.style.display = 'block'

    //Start New Problem
    generateSimpleProblem()
})

submitButton.addEventListener('click', () => {
    let userAnswer
    const inputString = answerInput.value.trim()

    if(inputString.includes('/')) {
        //Split Fraction
        const parts = inputString.split('/');
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);

        if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
            userAnswer = numerator / denominator;
        } else {
            alert("Invalid fraction format. Please try again.");
            return;
        }
    } else {
        //Handle decimal or integer input
        userAnswer = parseFloat(inputString);
    }

    //Check if the final converted answer is valid
    if (isNaN(userAnswer)) {
        alert("Please enter a valid number or fraction.");
        return;
    }

    //Compare the user's answer to the correct numerical answer
    const tolerance = 0.001; //For float comparison
    if (Math.abs(userAnswer - currentProblem.answer) < tolerance) {
        alert("Correct! You solved the problem.");
        // Code to start a new problem
    } else {
        alert("Incorrect. Please try again.");
    }

})

function generateSimpleProblem() {
    //Generate 2 Random Numbers
    let num1 = Math.floor(Math.random() * 10) + 1
    let num2 = Math.floor(Math.random() * 10) + 1

    //Random Operation
    let operation = ""
    if (num2 > 0 && num2 <= 3) {
        operation = "+"
    }
    else if (num2 > 3 && num2 <= 7) {
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

function generateHardProblem() {
    //Generate 3 Random Numbers
    let num1 = Math.floor(Math.random() * 10) + 2
    let num2 = Math.floor(Math.random() * 10) + 1
    let num3 = Math.floor(Math.random() * 10) + 1

    //Ensure no 0 division
    if (num1 === num2){
        num1 += 1
    }

    //Random Operation
    let operation = ""
    if (num2 < 5) {
        operation = "+"
    }
    else {
        operation = "-"
    }

    let question
    let answer

    if (operation === "+") {
        if (num2 > 5) {
            question = `${num1}x + ${num2} = ${num3}`
            answer = (num3-num2) / num1
        }
        else {
            question = `${num2}x = ${num3} + ${num1}x`
            answer =  num3 / (num2-num1)
        }
    }
    else {
        if (num2 > 5) {
            question = `${num1}x - ${num2} = ${num3}`
            answer = (num3+num2) / num1
        }
        else {
            question = `${num2}x = ${num3} - ${num1}x`
            answer =  num3 / (num2+num1)
        }
    }

    return {
        question: question,
        answer: answer
    }
}