const startScreen = document.getElementById("startPage")
const gameContainer = document.getElementById("gameContainer")
const startButton = document.getElementById("startButton")
const gameArea = document.getElementById("gameArea")
const body = document.getElementById("body")

const problemText = document.getElementById("problemTxt")
const answerOutput = document.getElementById("answerOutput")
const answerInput = document.getElementById("answerInput")
const submitButton = document.getElementById("submitButton")
const castle = document.getElementById("castle-image")
const hero = document.getElementById("hero-image")
const dragon = document.getElementById("dragon")

const newWaveScreen = document.getElementById("newWaveScreen")
const gameOverScreen = document.getElementById("gameOverScreen")
const restartButton = document.getElementById("restartButton")

const pauseScreen = document.getElementById("pauseScreen")
const pauseButton = document.getElementById("pauseButton")
const resumeButton = document.getElementById("resumeButton")

let enemiesDefeated = 0
let enemyArray = []
let totalEnemies = enemyArray.length + 1
let enemyId = 0

let spawnInterval = 0
let currentWave = 1
let enemiesSpawnedThisWave = 0
let enemiesPerWave = 8
let spawnRate = 4200
let movementInterval = 0

let isPaused = false

startButton.addEventListener("click", () => {
	//Hide Start Screen
	startScreen.style.display = "none"

	//Display Game
	gameContainer.style.display = "block"

	//Display Round 1
	newWaveScreen.style.display = "block"

	//Auto put cursor in answer box
	answerInput.focus()

	newWaveScreen.querySelector("p").textContent = `${currentWave}`
	setTimeout(() => {
		newWaveScreen.style.display = "none"
	}, 3000)

	//Spawn New Enemy
	spawnEnemy()
	enemy1 = gameArea.querySelector(`.enemy[data-id="${0}"]`)
	enemy1.classList.add("current-enemy")

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

		const killedEnemyId = enemyArray[0].id

		const arrowElement = shootArrow(killedEnemyId)

		setTimeout(() => {
			if (arrowElement) {
				arrowElement.remove()
			}

			enemyArray[0].x = -100
			enemyKilled(killedEnemyId)
			enemyArray.shift()

			enemy1 = gameArea.querySelector(`.enemy[data-id="${enemyArray[0].id}"]`)
			enemy1.classList.add("current-enemy")

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
		}, 220)
	} else {
		answerOutput.textContent = "Incorrect! Hurry!"
		shootDragon(enemyArray[0].id)
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

//For pausing game
document.addEventListener("visibilitychange", () => {
	// Check the computed display style for each element
	const gameOverScreenOn =
		window.getComputedStyle(gameOverScreen).display === "none"
	const startScreenOn =
		window.getComputedStyle(startScreen).display === "none"

	if (document.hidden && gameOverScreenOn && startScreenOn) {
		pauseGame()
	}
})
pauseButton.addEventListener("click", pauseGame)
resumeButton.addEventListener("click", resumeGame)

restartButton.addEventListener("click", () => {
	window.location.reload()
})

function gameLoop() {
	const castleCoord = document
		.getElementById("castle")
		.getBoundingClientRect()
	const collisionPoint = castleCoord.left

	// Loop through your enemy DATA array
	for (let i = 0; i < enemyArray.length; i++) {
		const enemyData = enemyArray[i]

		// Find the specific enemy div by matching the unique data-id attribute
		// to the ID in the enemyData object. This prevents the glitch caused by
		// the array shifting while the old DOM element is still vanishing.
		const enemyDiv = gameArea.querySelector(
			`.enemy[data-id="${enemyData.id}"]`
		)

		// Update the enemy's position in the data
		enemyData.x += 0.8 // This is the speed

		// Check for collision with the castle
		if (
			enemyDiv &&
			enemyDiv.getBoundingClientRect().right >= collisionPoint
		) {
			setTimeout(() => {
				endGame()
			}, 1200)
			hero.style.display = "none"
			castle.src = "number-Explosion.png"
			gameArea.style.display = "none"
			return
		}

		// If no collision, update the visual position on the screen
		if (enemyDiv) {
			// Make sure the div exists
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
		const newEnemyId = enemyId++
		const enemyElement = document.createElement("div")
		enemyElement.className = "enemy"
		enemyElement.setAttribute("data-id", newEnemyId)

		//Create an img element for the enemy's image
		const enemyImageElement = document.createElement("img")
		enemyImageElement.className = "enemy-image"

		//Create enemyIdCounter
		let newEnemyData

		//Generate New Problem
		if (totalEnemies % 4 == 0) {
			newEnemyData = generateHardProblem()
			enemyImageElement.src = "big_function.png"
			enemyImageElement.id = "big_function"
		} else {
			newEnemyData = generateSimpleProblem()
			enemyImageElement.src = "little_function.png"
		}
		//Enemy Data ID
		newEnemyData.id = newEnemyId

		//Push enemy data to array
		enemyArray.push(newEnemyData)

		//Create a div for the problem text
		const problemTextElement = document.createElement("div")
		problemTextElement.textContent = newEnemyData.question
		problemTextElement.className = "problem-text"

		enemyElement.style.transform = `translateX(${newEnemyData.x}px)`

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

function enemyKilled(id) {
	const enemyToRemove = gameArea.querySelector(`.enemy[data-id="${id}"]`)

	if (enemyToRemove) {
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
	gameOverScreen.style.display = "flex"
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

// Pauses game
function pauseGame() {
	if (!isPaused) {
		isPaused = true
		clearInterval(spawnInterval)
		clearInterval(movementInterval)

		pauseScreen.style.display = "flex"
	}
}

// Resumes the game
function resumeGame() {
	if (isPaused) {
		isPaused = false
		spawnInterval = setInterval(spawnEnemy, spawnRate)
		movementInterval = setInterval(gameLoop, 16)

		// Hide the pause screen
		pauseScreen.style.display = "none"

		//Cursor
		answerInput.focus()
	}
}

//Arrow being shot
function shootArrow(id) {
	const heroCord = hero.getBoundingClientRect()
	const gameAreaCord = gameArea.getBoundingClientRect()
	const targetEnemy = gameArea.querySelector(`.enemy[data-id="${id}"]`)
	const enemyCord = targetEnemy.getBoundingClientRect()

	//Make sure enemy still exists
	if (!targetEnemy) return

	//Create arrow
	const arrow = document.createElement("div")
	arrow.className = "arrow"
	arrow.id = `arrow-${id}`
	gameArea.appendChild(arrow)

	//Calculate start/end positions
	const startX = heroCord.right - gameAreaCord.left - 20 //Start near hero
	const startY = heroCord.top - gameAreaCord.top + 20 //Align with hero

	const endX = enemyCord.left - gameAreaCord.left // End at enemy's left edge
	const endY = enemyCord.top - gameAreaCord.top + enemyCord.height / 6 // End at enemy's vertical

	//Initialize arrow position
	arrow.style.transform = `translate(${startX}px, ${startY}px)`

	setTimeout(() => {
		// Trigger the CSS transition to move the arrow to the enemy
		arrow.style.transform = `translate(${endX}px, ${endY}px)`
	}, 10)

	//return for removal
	return arrow
}

function shootDragon(id) {
	const dragonCord = dragon.getBoundingClientRect()
	const heroCord = hero.getBoundingClientRect()
	const gameAreaCord = gameArea.getBoundingClientRect()

	//Create arrow
	const arrow = document.createElement("div")
	arrow.className = "arrow"
	arrow.id = `arrow-${id}`
	gameArea.appendChild(arrow)

	//Calculate start/end positions
	const startX = heroCord.right - gameAreaCord.left - 20 //Start near hero
	const startY = heroCord.top - gameAreaCord.top + 20 //Align with hero

	const endX = dragonCord.left - gameAreaCord.left - 80 // End at enemy's left edge
	const endY = dragonCord.top - gameAreaCord.top + 235 // End at enemy's vertical

	//Initialize arrow position
	arrow.style.transform = `translate(${startX}px, ${startY}px)`

	setTimeout(() => {
		// Trigger the CSS transition to move the arrow to the enemy
		arrow.style.transform = `translate(${endX}px, ${endY}px)`
	}, 10)

	//return for removal
	return arrow
}
