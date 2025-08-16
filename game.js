const Board = require ('./board.js')
const Question = require('./question.js')
const QuestionBank = require('./questionBank.js')
const questionsData = require('./questionsData.js')
const readline = require('readline')


class Game{
    constructor() {
     this.BOARD = new Board()
     this.currentPlayer = this.BOARD.PLAYER1
     this.lives = {
        [this.BOARD.PLAYER1]:3,
        [this.BOARD.PLAYER2]:3
     }
     this.isGameActive = true
     this.TURN_TIME_LIMIT = 5000  // Single source of truth
     this.timer = this.TURN_TIME_LIMIT 
     this.timerID = null
     
     // Initialize QuestionBank
     this.questionBank = new QuestionBank()
     this.loadQuestions()

     this.cellQuestionCache = new Map() // Key: "row,col", Value: Question object
     // Initialize readline interface
     this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })
    this.pendingInputPromise = null
    this.inputCancelled = false
     this.startTurnTimer()
     
    }
    cleanupAndExit() {
        this.pauseTimer() // Clear any active timers
        this.rl.close()
        process.stdin.destroy()
        console.log("🎮 Game Over!")
    }
    cancelPendingInput(partialInput = '') {
        this.inputCancelled = true
        
        // Clear the current input line
        this.rl.write('\r\x1b[K')
        
        // Enhanced timeout message with user's input
        if (partialInput && partialInput.trim() !== '') {
            console.log(`⏰ Time expired! Your input '${partialInput}' was not accepted. Moving to next player...`)
        } else {
            console.log('⏰ Time expired! No input received. Moving to next player...')
        }
    }
    // Get move input from terminal
    async getMoveInput() {
        return new Promise((resolve, reject) => {
            this.inputCancelled = false
            
            this.rl.question(`${this.currentPlayer}, enter your move (row,col like 0,1): `, (input) => {
                if (this.inputCancelled) {
                    reject(new Error('Input cancelled due to timeout'))
                    return
                }
                
                const coords = input.trim().split(',')
                if (coords.length === 2) {
                    const row = parseInt(coords[0])
                    const col = parseInt(coords[1])
                    if (row >= 0 && row <= 2 && col >= 0 && col <= 2) {
                        resolve({ row, col })
                    } else {
                        console.log("Invalid coordinates! Use 0-2 for row and column.")
                        this.getMoveInput().then(resolve).catch(reject)
                    }
                } else {
                    console.log("Invalid format! Use: row,col (like 1,2)")
                    this.getMoveInput().then(resolve).catch(reject)
                }
            })
        })
    }

    // Start game loop with terminal input
    async startGame() {
        console.log("🎮 Tic-Tac-Toe Blitz Started!")
        console.log("Enter moves as row,col (0-2). Example: 1,2 for middle-right")
        console.log(`⚠️  You have ${this.TURN_TIME_LIMIT / 1000} seconds per turn!`)
        this.BOARD.displayBoard()
        
        while (this.isGameActive) {
            try {
                const move = await this.getMoveInput()
                await this.makeMove(move.row, move.col)
            } catch (error) {
                // Just log non-timeout errors, let the loop condition handle flow
                if (!error.message.includes('timeout')) {
                    console.log("Error:", error.message)
                }
            }
            // No continue needed - loop naturally checks isGameActive
        }
        // Game ended, clean up resources
        this.cleanupAndExit()
    }
    async getPlayerInput() {
        return new Promise((resolve) => {
            this.rl.question('Enter your answer (A, B, C, or D): ', (answer) => {
                resolve(answer.trim().toUpperCase())
            })
        })
    }
    // Load questions from data file into QuestionBank
    // This will be called once at the start of the game

    loadQuestions() {
        // Load raw data and extract IDs
        this.questionBank.rawQuestionData = questionsData
        questionsData.forEach(questionData => {
            this.questionBank.addQuestion(questionData.id)
        })
        console.log(`Loaded ${questionsData.length} questions into question bank`)
    }
    startTurnTimer() {
        if (this.timerID) {
            clearTimeout(this.timerID)
        }
        
        this.timerID = setTimeout(() => {
            // Try to capture what the user was typing (if possible)
            const currentInput = this.rl.line || '' // readline's current input buffer
            this.cancelPendingInput(currentInput)
            this.nextTurn(true, true)
        }, this.TURN_TIME_LIMIT)
    }
    pauseTimer() {
        if (this.timerID) {
            clearTimeout(this.timerID)
            this.timerID = null
        }
    }

    resumeTimer() {
        this.startTurnTimer()
    }
    // Create Question object from raw data
    createQuestionFromId(questionId) {
        const rawData = this.questionBank.rawQuestionData.find(q => q.id === questionId)
        if (!rawData) {
            throw new Error(`Question with ID ${questionId} not found`)
        }
        
        return new Question(
            rawData.question,
            rawData.answers,
            rawData.category,
            rawData.difficulty,
            rawData.correctAnswer
        )
    }
    // Main question asking method
    async askQuestion(row, col) {
        
        let questionObj
        const cellKey = `${row},${col}`
        
        // Check if this cell has a cached question
        if (this.cellQuestionCache.has(cellKey)) {
            questionObj = this.cellQuestionCache.get(cellKey)
            console.log("Retrieving cached question for this cell...")
        } else {
            // Get new random question
            const questionId = this.questionBank.getRandomQuestion()
            if (!questionId) {
                console.log("No questions available!")
                // this.resumeTimer()
                return false
            }
            questionObj = this.createQuestionFromId(questionId)
        }

        // Display question
        console.log(`\n=== QUESTION FOR ${this.currentPlayer} ===`)
        console.log(questionObj.question)
        console.log("Options:")
        const answers = questionObj.getAnswers()
        Object.entries(answers).forEach(([letter, answer]) => {
            console.log(`${letter}: ${answer}`)
        })

        // Get player answer (this will be replaced with UI input later)
        const playerAnswer = await this.getPlayerInput() // You'll need to implement this
        
        // Check if answer is correct
        const isCorrect = questionObj.isCorrect(playerAnswer)
        
        if (isCorrect) {
            console.log("✅ Correct! You get the cell!")
            // Mark question as used and place player mark
            this.questionBank.markQuestionAsUsed(this.getQuestionId(questionObj))
            // Replace with these debug lines:
            const placed = this.BOARD.placeMark(row, col, this.currentPlayer, true)
            console.log(`DEBUG: Placed ${this.currentPlayer} at (${row},${col}): ${placed}`)
            // Remove from cache if it was cached
            this.cellQuestionCache.delete(cellKey)
        } else {
            console.log("❌ Wrong answer! Question stays in this cell.")
            // Cache the question for this specific cell
            this.cellQuestionCache.set(cellKey, questionObj)
            // Update cell mark to show it's cached
            this.BOARD.placeMark(row, col, this.BOARD.CACHE, true)
        }
        
        // this.resumeTimer()
        return isCorrect
    }
    // Helper method to get question ID from raw data (temporary solution)
    getQuestionId(questionObj) {
        const rawData = this.questionBank.rawQuestionData.find(q => 
            q.question === questionObj.question
        )
        return rawData ? rawData.id : null
    }
    // Placeholder for player input - will be replaced with UI
    // Get real player input from terminal
    async getPlayerInput() {
        return new Promise((resolve) => {
            this.rl.question('Enter your answer (A, B, C, or D): ', (answer) => {
                resolve(answer.trim().toUpperCase())
            })
        })
    }
    nextTurn(penalty, calledByTimer = false) {
        if(penalty) {
            this.lives[this.currentPlayer] -= 1
            console.log(`${this.currentPlayer} has ${this.lives[this.currentPlayer]} lives left.`)
        }
        if (this.isGameActive) {
            
            // Check if there is a winner
            const winner = this.BOARD.checkWinner()
            if (winner) { 
                this.isGameActive = false // If there is a winner, stop the game
                console.log(winner)
            }
            // If a player has no lives left, stop the game
            else if(this.lives[this.currentPlayer] <= 0) {
                this.isGameActive = false
                console.log(`${this.currentPlayer} has lost all lives.`)
                this.switchPlayer()
                console.log(`${this.currentPlayer} wins! Game over.`)
                return
              }
            // Otherwise, switch to the next player and start the timer
            else {
                this.switchPlayer()
                console.log(`Next player's turn: ${this.currentPlayer}`)
                this.randomizedBombPlacement()
                
                // Only auto-start timer if NOT called by timer expiration
                if (!calledByTimer) {
                    this.startTurnTimer()
                }
            }
        }
    }
    async makeMove(row, col) {
        if (this.isGameActive) {
            if (this.BOARD.isCellEmpty(row, col)) {
                this.BOARD.placeMark(row, col, this.currentPlayer)
                this.BOARD.displayBoard()
                this.nextTurn(false)
            }
            else if (this.BOARD.grid[row][col] === this.BOARD.BOMB || 
                     this.BOARD.grid[row][col] === this.BOARD.CACHE) {
                // Handle both fresh bombs and cached questions
                this.pauseTimer() // Pause game timer
                const isCorrect = await this.askQuestion(row, col)
                this.BOARD.displayBoard()
                this.nextTurn(!isCorrect) // Penalty only if wrong answer
            }
            else {
                console.log(`Cell (${row}, ${col}) is already occupied by ${this.BOARD.grid[row][col]}. Try again.`)
            }
        }
    }
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.BOARD.PLAYER1 ? this.BOARD.PLAYER2 : this.BOARD.PLAYER1
    }

    randomizedBombPlacement() {
       const randomizeGenerator = () => Math.floor(Math.random() * 3)
       const bombCount = randomizeGenerator()
       if (bombCount === 0) return false // No bomb placement
       let attempts = 0
       let placedBombs = 0
       let maxAttempts = bombCount * 2 
       while (placedBombs < bombCount && attempts < maxAttempts) {
        const row = randomizeGenerator()
        const col = randomizeGenerator()
        if (this.BOARD.isCellEmpty(row, col)) {
            this.BOARD.placeMark(row, col, this.BOARD.BOMB)
            placedBombs++
            console.log(`Bomb placed at (${row}, ${col})`)
        }
        attempts++
       }
    }
}

if (typeof module !== 'undefined'){
    module.exports = Game
}
   