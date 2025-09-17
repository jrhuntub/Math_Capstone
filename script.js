const startScreen = document.getElementById("startPage")
const gameContainer = document.getElementById("gameContainer")
const startButton = document.getElementById("startButton")
const gameArea = document.getElementById("gameArea")

const problemText = document.getElementById("problemTxt")
const answerInput = document.getElementById("answerInput")
const submitButton = document.getElementById("submitButton")
const gameOverScreen = document.getElementById("gameOverScreen")
const restartButton = document.getElementById("restartButton")

let enemiesDefeated = 0
let enemyArray = []
let totalEnemies = enemyArray.length + 1
let spawnInterval
let currentWave = 1
let enemiesSpawnedThisWave = 0
let enemiesPerWave = 8
let spawnRate = 3000
let movementInterval

startButton.addEventListener("click", () => {
	//Hide Start Screen
	startScreen.style.display = "none"

	//Display Game
	gameContainer.style.display = "block"

	//Spawn New Enemy
	spawnEnemy()

	//Start the enemy spawner
	spawnInterval = setInterval(spawnEnemy, spawnRate)

	//Start the movement game loop
	movementInterval = setInterval(gameLoop, 16)
})

submitButton.addEventListener("click", () => {
	let userAnswer
	const inputString = answerInput.value.trim()

	if (inputString.includes("/")) {
		//Split Fraction
		const parts = inputString.split("/")
		const numerator = parseFloat(parts[0])
		const denominator = parseFloat(parts[1])

		if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
			userAnswer = numerator / denominator
		} else {
			alert("Invalid fraction format. Please try again.")
			return
		}
	} else {
		//Handle decimal or integer input
		userAnswer = parseFloat(inputString)
	}

	//Check if the final converted answer is valid
	if (isNaN(userAnswer)) {
		alert("Please enter a valid number or fraction!")
		return
	}

	//Compare the user's answer to the correct numerical answer
	const tolerance = 0.001 //For float comparison
	if (Math.abs(userAnswer - enemyArray[0].answer) < tolerance) {
		alert("Correct! You solved the problem.")

		enemyKilled()
		enemyArray.shift()

		if (
			enemiesSpawnedThisWave >= enemiesPerWave &&
			enemyArray.length === 0
		) {
			submitButton.disabled = true
			startNewWave()
		} else {
			if (enemyArray.length > 0) {
				problemText.textContent = enemyArray[0].question
			} else {
				problemText.textContent = "Waiting for more enemies..."
			}
		}

		answerInput.value = ""
		enemiesDefeated++
		submitButtonState()
	} else {
		alert("Incorrect! Hurry!")
	}
})

restartButton.addEventListener("click", () => {
	window.location.reload()
})

function gameLoop() {
	//Get all the enemy divs on the screen
	const allEnemyDivs = document.querySelectorAll(".enemy")

	//Loop through your enemy DATA array
	for (let i = 0; i < enemyArray.length; i++) {
		const enemyData = enemyArray[i]
		const enemyDiv = allEnemyDivs[i]

		//Update the enemy's position in the data
		enemyData.x += 0.1 //This is the speed

		//Check for collision with the castle
		if (enemyData.x >= 0) {
			// Checks for reaching the castle from the left
			endGame()
			return
		}

		//If no collision, update the visual position on the screen
		if (enemyDiv) {
			//Make sure the div exists
			enemyDiv.style.transform = `translateX(${enemyData.x}%)`
		}
	}
}

function submitButtonState() {
	//Update whether enemies are on screen
	if (enemyArray.length === 0) {
		submitButton.disabled = true
	} else {
		submitButton.disabled = false
	}
}

function spawnEnemy() {
	if (enemiesSpawnedThisWave < enemiesPerWave) {
		//Create Enemy container div
		const enemyElement = document.createElement("div")
		enemyElement.className = "enemy"

		//Create an img element for the enemy's image
		const enemyImageElement = document.createElement("img")
		enemyImageElement.className = "enemy-image"

		//Generate New Problem
		if (totalEnemies % 4 == 0) {
			enemyArray.push(generateHardProblem())
			enemyImageElement.src = "largeEnemy.png"
		} else {
			enemyArray.push(generateSimpleProblem())
			enemyImageElement.src = "smallEnemy.png"
		}

		//Create a div for the problem text
		const problemTextElement = document.createElement("div")
		problemTextElement.textContent =
			enemyArray[enemyArray.length - 1].question
		problemTextElement.className = "problem-text"

		//Append the text and image to the enemy container
		enemyElement.appendChild(problemTextElement)
		enemyElement.appendChild(enemyImageElement)
		gameArea.appendChild(enemyElement)

		totalEnemies++

		enemiesSpawnedThisWave++

		submitButtonState()
	}
}

function startNewWave() {
	currentWave++
	enemiesSpawnedThisWave = 0
	enemiesPerWave += 2

	spawnRate *= 0.85
	if (spawnRate < 500) {
		spawnRate = 500
	}

	problemText.textContent = `Wave ${currentWave} is starting!`

	clearInterval(spawnInterval)

	setTimeout(() => {
		spawnInterval = setInterval(spawnEnemy, spawnRate)
		problemText.textContent = ""
		submitButtonState()
	}, 2000)
}

function enemyMovement() {
	//Enemy movement speed and location
}

function enemyKilled() {
	const enemyToRemove = gameArea.querySelector(".enemy")

	if (enemyToRemove) {
		enemyToRemove.classList.add("vanishing")

		setTimeout(() => {
			gameArea.removeChild(enemyToRemove)
		}, 500)
	}
}

function endGame() {
	console.log("Game Over!") //For debugging

	//Stop the enemy spawner and the movement loop
	clearInterval(spawnInterval)
	clearInterval(movementInterval)

	//Hide the game and show the game over screen
	gameContainer.style.display = "none"
	gameOverScreen.style.display = "block"
}

function generateSimpleProblem() {
	//Generate 2 Random Numbers
	let num1 = Math.floor(Math.random() * 10) + 1
	let num2 = Math.floor(Math.random() * 10) + 1

	//Random Operation
	let operation = ""
	if (num2 > 0 && num2 <= 3) {
		operation = "+"
	} else if (num2 > 3 && num2 <= 7) {
		operation = "-"
	} else {
		operation = "*"
	}

	let question
	let answer

	if (operation === "+") {
		question = `${num1} + ${num2}`
		answer = num1 + num2
	} else if (operation === "-") {
		question = `${num1} - ${num2}`
		answer = num1 - num2
	} else {
		question = `${num1} * ${num2}`
		answer = num1 * num2
	}

	return {
		question: question,
		answer: answer,
		x: -100,
	}
}

function generateHardProblem() {
	//Generate 3 Random Numbers
	let num1 = Math.floor(Math.random() * 10) + 2
	let num2 = Math.floor(Math.random() * 10) + 1
	let num3 = Math.floor(Math.random() * 10) + 1

	//Ensure no 0 division
	if (num1 === num2) {
		num1 += 1
	}

	//Random Operation
	let operation = ""
	if (num2 < 5) {
		operation = "+"
	} else {
		operation = "-"
	}

	let question
	let answer

	if (operation === "+") {
		if (num2 > 5) {
			question = `${num1}x + ${num2} = ${num3}`
			answer = (num3 - num2) / num1
		} else {
			question = `${num2}x = ${num3} + ${num1}x`
			answer = num3 / (num2 - num1)
		}
	} else {
		if (num2 > 5) {
			question = `${num1}x - ${num2} = ${num3}`
			answer = (num3 + num2) / num1
		} else {
			question = `${num2}x = ${num3} - ${num1}x`
			answer = num3 / (num2 + num1)
		}
	}

	return {
		question: question,
		answer: answer,
		x: -100,
	}
}
