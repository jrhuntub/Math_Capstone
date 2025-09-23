const startScreen = document.getElementById("startPage")
const gameContainer = document.getElementById("gameContainer")
const startButton = document.getElementById("startButton")
const gameArea = document.getElementById("gameArea")
const body = document.getelement("body")

const problemText = document.getElementById("problemTxt")
const answerOutput = document.getElementById("answerOutput")
const answerInput = document.getElementById("answerInput")
const submitButton = document.getElementById("submitButton")

const newWaveScreen = document.getElementById("newWaveScreen")
const gameOverScreen = document.getElementById("gameOverScreen")
const restartButton = document.getElementById("restartButton")

let enemiesDefeated = 0
let enemyArray = []
let totalEnemies = enemyArray.length + 1

let spawnInterval = 0
let currentWave = 1
let enemiesSpawnedThisWave = 0
let enemiesPerWave = 8
let spawnRate = 4200
let movementInterval = 0

startButton.addEventListener("click", () => {
	//Hide Start Screen
	startScreen.style.display = "none"

	//Display Game
	gameContainer.style.display = "block"

	//Display Round 1
	newWaveScreen.style.display = "block"

	//Change body styles FIXXXXXXX
	body.style.margin = "20px"

	newWaveScreen.querySelector("p").textContent = `${currentWave}`
	setTimeout(() => {
		newWaveScreen.style.display = "none"
	}, 3000)

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
			answerOutput.textContent = "Invalid fraction. Please try again."
			setTimeout(() => {
			answerOutput.textContent = ""
			}, 2000)
			return
		}
	} else {
		//Handle decimal or integer input
		userAnswer = parseFloat(inputString)
	}

	//Check if the final converted answer is valid
	if (isNaN(userAnswer)) {
		answerOutput.textContent = "Please enter a valid number or fraction!"
		setTimeout(() => {
			answerOutput.textContent = ""
		}, 2000)
		return
	}

	//Compare user's answer to the correct numerical answer
	const tolerance = 0.001 //For float comparison
	if (Math.abs(userAnswer - enemyArray[0].answer) < tolerance) {
		answerOutput.textContent = "Correct! You solved the problem"
		answerInput.value = ""

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
		answerOutput.textContent = "Incorrect! Hurry!"
	}

	setTimeout(() => {
			answerOutput.textContent = ""
		}, 2000)
})

answerInput.addEventListener("keydown", (event) => {
	//Lets the user press Enter to submit answer
	if (event.key === "Enter") {
		submitButton.click()
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
		enemyData.x += 0.45 //This is the speed

		//Check for collision with the castle
		if (enemyData.x >= 1400) {
			endGame()
			return
		}

		//If no collision, update the visual position on the screen
		if (enemyDiv) {
			//Make sure the div exists
			enemyDiv.style.transform = `translateX(${enemyData.x}px)`
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
			enemyImageElement.src = "big_function.png"
		} else {
			enemyArray.push(generateSimpleProblem())
			enemyImageElement.src = "little_function.png"
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

	newWaveScreen.style.display = "block"
	newWaveScreen.querySelector("p").textContent = `${currentWave}`

	clearInterval(spawnInterval)

	setTimeout(() => {
		newWaveScreen.style.display = "none"
		spawnInterval = setInterval(spawnEnemy, spawnRate)
		problemText.textContent = ""
		submitButtonState()
	}, 3000)
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
