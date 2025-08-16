// game.js - FIXED Browser-ready Game class with race condition prevention
class Game {
    constructor() {
        // Core game state
        this.BOARD = new Board()
        this.questionBank = new QuestionBank()
        this.questionUI = new QuestionUI()
        
        this.currentPlayer = this.BOARD.PLAYER1
        this.lives = {
            [this.BOARD.PLAYER1]: 3,
            [this.BOARD.PLAYER2]: 3
        }
        this.isGameActive = false
        this.isPaused = false
        
        // NEW: Race condition prevention
        this.isBoardFrozen = false
        this.isProcessingMove = false
        
        // Timer system - ENHANCED for pause/resume
        this.TURN_TIME_LIMIT = 5000 // 5 seconds
        this.timerID = null
        this.inputCancelled = false
        this.pausedTimeRemaining = 0 // Track remaining time when paused
        this.timerStartTime = 0
        
        // Question caching system
        this.cellQuestionCache = new Map()
        
        // UI elements (will be bound in initUI)
        this.gameContainer = null
        this.cellElements = []
        this.livesElements = {}
        this.timerElements = {}
        this.controlButtons = {}
        
        // Game callbacks
        this.onGameEnd = null
        this.onPlayerChange = null
        this.onLivesChange = null
    }

    /**
     * Initialize the game UI and bind events
     */
    async initUI() {
        this.bindUIElements()
        this.bindEvents()
        await this.loadQuestions()
        
        // ENHANCED: Set up sound callbacks for immediate question feedback
        this.questionUI.setSoundCallbacks(
            () => this.playSound('life-saved'),   // Correct answer sound
            () => this.playSound('life-lost')     // Incorrect answer sound
        )
        
        this.updateUI()
        console.log('🎮 Game initialized and ready!')
    }

    /**
     * Bind DOM elements to class properties
     */
    bindUIElements() {
        // Game board cells
        this.cellElements = []
        for (let row = 0; row < 3; row++) {
            this.cellElements[row] = []
            for (let col = 0; col < 3; col++) {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`)
                if (cell) {
                    this.cellElements[row][col] = cell
                }
            }
        }

        // Lives elements
        this.livesElements = {
            [this.BOARD.PLAYER1]: {
                container: document.getElementById('playerXLives'),
                hearts: document.querySelectorAll('#playerXLives .heart')
            },
            [this.BOARD.PLAYER2]: {
                container: document.getElementById('playerOLives'),
                hearts: document.querySelectorAll('#playerOLives .heart')
            }
        }

        // Timer elements
        this.timerElements = {
            container: document.querySelector('.timer-section'),
            playerName: document.getElementById('timerText'),        
            countdown: document.getElementById('timerCountdown'),     
            progressBar: document.getElementById('timerBar')         
        }

        // Control buttons
        this.controlButtons = {
            newGame: document.getElementById('newGameBtn'),
            pause: document.getElementById('pauseBtn'),
            settings: document.getElementById('settingsBtn'),
            sound: document.getElementById('soundBtn')
        }

        // Game containers
        this.gameContainer = document.querySelector('.game-container')
        this.gameBoardElement = document.getElementById('gameBoard')
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Cell click events
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.cellElements[row][col]
                if (cell) {
                    cell.addEventListener('click', () => this.handleCellClick(row, col))
                }
            }
        }

        // Control button events
        if (this.controlButtons.newGame) {
            this.controlButtons.newGame.addEventListener('click', () => this.startNewGame())
        }
        if (this.controlButtons.pause) {
            this.controlButtons.pause.addEventListener('click', () => this.togglePause())
        }
        
        // NEW: End Game button - handled by app.js, but bind here for completeness
        const endGameBtn = document.getElementById('endGameBtn')
        if (endGameBtn) {
            console.log('🛑 End Game button found and ready')
        }

        // FIXED: Enhanced keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Don't interfere when typing in inputs or if modals are open
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || 
                document.querySelector('.modal.active')) {
                return
            }

            if (e.key === ' ') { // Spacebar for pause
                e.preventDefault()
                if (this.isGameActive) {
                    this.togglePause()
                }
            } else if (e.key === 'n' || e.key === 'N') { // N for new game
                this.startNewGame()
            }
        })
    }

    /**
     * Load questions from data file
     */
    async loadQuestions() {
        try {
            if (typeof questionsData !== 'undefined') {
                return this.questionBank.loadQuestions(questionsData)
            } else {
                console.warn('No questionsData found - using demo questions')
                const demoQuestions = [
                    {
                        id: 1,
                        question: "What is 5 + 3?",
                        answers: ["6", "7", "8", "9"],
                        correctAnswer: "C",
                        category: "Math",
                        difficulty: "Easy"
                    }
                ]
                return this.questionBank.loadQuestions(demoQuestions)
            }
        } catch (error) {
            console.error('Error loading questions:', error)
            return false
        }
    }

    /**
     * NEW: Freeze board to prevent race conditions
     */
    freezeBoard(reason = 'processing') {
        this.isBoardFrozen = true
        if (this.gameBoardElement) {
            this.gameBoardElement.classList.add('frozen')
            this.gameBoardElement.setAttribute('data-frozen-reason', reason)
        }
        console.log(`🧊 Board frozen: ${reason}`)
    }

    /**
     * NEW: Unfreeze board
     */
    unfreezeBoard() {
        this.isBoardFrozen = false
        if (this.gameBoardElement) {
            this.gameBoardElement.classList.remove('frozen')
            this.gameBoardElement.removeAttribute('data-frozen-reason')
        }
        console.log('🔓 Board unfrozen')
    }

    /**
     * Start a new game
     */
    async startNewGame() {
        this.resetGame()
        this.isGameActive = true
        this.isPaused = false
        this.updateUI()
        this.randomizedBombPlacement()
        this.startTurnTimer()
        console.log('🎮 New game started!')
    }

    /**
     * Reset game state - ENHANCED
     */
    resetGame() {
        // Clear timers and unfreeze board
        this.pauseTimer()
        this.unfreezeBoard()
        
        // Reset game state
        this.BOARD.reset()
        this.currentPlayer = this.BOARD.PLAYER1
        this.lives = {
            [this.BOARD.PLAYER1]: 3,
            [this.BOARD.PLAYER2]: 3
        }
        this.isGameActive = false
        this.isPaused = false
        this.inputCancelled = false
        this.pausedTimeRemaining = 0
        this.timerStartTime = 0
        this.isProcessingMove = false
        
        // Clear question cache
        this.cellQuestionCache.clear()
        
        // Reset question bank available questions
        if (this.questionBank.rawQuestionData.length > 0) {
            this.questionBank.loadQuestions(this.questionBank.rawQuestionData)
        }

        // FIXED: Reset statistics display
        this.triggerStatsUpdate()
    }

    /**
     * FIXED: Trigger statistics update
     */
    triggerStatsUpdate() {
        if (window.TicTacToeBlitzApp) {
            window.TicTacToeBlitzApp.updateStatsDisplay()
        }
    }

    /**
     * ENHANCED: Handle cell click events with race condition prevention
     */
    async handleCellClick(row, col) {
        // CRITICAL: Prevent race conditions
        if (!this.isGameActive || this.isPaused || this.questionUI.isQuestionVisible() || 
            this.isBoardFrozen || this.isProcessingMove) {
            console.log('🚫 Cell click ignored - game state:', {
                isGameActive: this.isGameActive,
                isPaused: this.isPaused,
                questionVisible: this.questionUI.isQuestionVisible(),
                boardFrozen: this.isBoardFrozen,
                processingMove: this.isProcessingMove
            })
            return
        }

        try {
            this.isProcessingMove = true
            await this.makeMove(row, col)
        } catch (error) {
            console.error('Error handling cell click:', error)
        } finally {
            this.isProcessingMove = false
        }
    }

    /**
     * ENHANCED: Make a move with proper board freezing
     */
    async makeMove(row, col) {
        if (!this.isGameActive) return

        const cellValue = this.BOARD.grid[row][col]

        if (this.BOARD.isCellEmpty(row, col)) {
            // Regular move to empty cell
            this.BOARD.placeMark(row, col, this.currentPlayer)
            this.updateUI()
            this.nextTurn(false)
            
        } else if (cellValue === this.BOARD.BOMB || cellValue === this.BOARD.CACHE) {
            // CRITICAL: Freeze board immediately when bomb/cached question is hit
            this.freezeBoard(cellValue === this.BOARD.BOMB ? 'bomb-hit' : 'cached-question')
            this.pauseTimer() // Stop the timer immediately
            
            // ENHANCED: Bomb reveal effect
            if (cellValue === this.BOARD.BOMB) {
                this.triggerBombRevealEffect(row, col)
                this.playSound('bomb-hit')
                // Brief delay for bomb effect while board is frozen
                await new Promise(resolve => setTimeout(resolve, 800))
            }
            
            // Ask question while board remains frozen
            const isCorrect = await this.askQuestion(row, col)
            
            // Unfreeze board after question is complete
            this.unfreezeBoard()
            
            this.nextTurn(!isCorrect) // Penalty only if wrong answer
            
        } else {
            // Cell is occupied by player - show feedback
            this.showCellOccupiedFeedback(row, col, cellValue)
        }
    }

    /**
     * NEW: Trigger bomb reveal effect
     */
    triggerBombRevealEffect(row, col) {
        const cell = this.cellElements[row][col]
        if (cell) {
            // Add explosion effect class
            cell.classList.add('bomb-reveal')
            cell.textContent = '💥'
            
            // Remove effect after animation
            setTimeout(() => {
                cell.classList.remove('bomb-reveal')
                cell.textContent = '💣'
            }, 600)
        }
    }

    /**
     * Ask question - ENHANCED with better sound timing
     */
    async askQuestion(row, col) {
        const cellKey = `${row},${col}`
        let questionObj

        // Check if question is cached for this cell
        if (this.cellQuestionCache.has(cellKey)) {
            console.log('Retrieving cached question for this cell...')
            questionObj = this.cellQuestionCache.get(cellKey)
        } else {
            // Get new question from bank
            const questionId = this.questionBank.getRandomQuestion()
            if (!questionId) {
                console.error('No questions available!')
                return false
            }
            questionObj = this.questionBank.getQuestionById(questionId)
            if (!questionObj) {
                console.error('Failed to load question!')
                return false
            }
        }

        try {
            // Show question modal and wait for answer
            const selectedAnswer = await this.questionUI.showQuestion(questionObj, this.currentPlayer)
            const isCorrect = questionObj.isCorrect(selectedAnswer)

            if (isCorrect) {
                console.log("✅ Correct! You get the cell!")
                // Sound already played via callback
                
                // Mark question as used and place player mark
                const questionId = this.getQuestionId(questionObj)
                this.questionBank.markQuestionAsUsed(questionId)
                this.BOARD.placeMark(row, col, this.currentPlayer, true)
                
                // Remove from cache if it was cached
                this.cellQuestionCache.delete(cellKey)
                
                // Trigger success effect
                this.triggerEffect('life-saved', row, col)
                
            } else {
                console.log("❌ Wrong answer! Question stays in this cell.")
                // Sound already played via callback
                
                // Cache question for this cell and mark with ?
                this.cellQuestionCache.set(cellKey, questionObj)
                this.BOARD.placeMark(row, col, this.BOARD.CACHE, true)
                
                // Trigger failure effect
                this.triggerEffect('life-lost', row, col)
            }

            this.updateUI()
            return isCorrect

        } catch (error) {
            console.error('Error asking question:', error)
            return false
        }
    }

    /**
     * Play sound effect
     */
    playSound(soundName) {
        // Check if we have access to the app's audio system
        if (window.TicTacToeBlitzApp && window.TicTacToeBlitzApp.audioSystem) {
            window.TicTacToeBlitzApp.audioSystem.play(soundName)
        } else {
            console.log(`🔊 Sound effect: ${soundName}`)
        }
    }

    /**
     * Get question ID from question object (helper method)
     */
    getQuestionId(questionObj) {
        // Find the question ID from rawQuestionData
        const questionData = this.questionBank.rawQuestionData.find(q => 
            q.question === questionObj.question && 
            q.correctAnswer === questionObj.correctAnswer
        )
        return questionData ? questionData.id : null
    }

    /**
     * ENHANCED: Handle next turn logic with board state management
     */
    nextTurn(penalty, calledByTimer = false) {
        // If called by timer, freeze board momentarily for transition clarity
        if (calledByTimer) {
            this.freezeBoard('timer-expired')
            // Give a brief moment for the timeout effect
            setTimeout(() => {
                this.continueNextTurn(penalty)
            }, 500)
        } else {
            this.continueNextTurn(penalty)
        }
    }

    /**
     * NEW: Continue next turn logic (separated for timer handling)
     */
    continueNextTurn(penalty) {
        if (penalty) {
            this.lives[this.currentPlayer] -= 1
            console.log(`${this.currentPlayer} has ${this.lives[this.currentPlayer]} lives left.`)
            
            // Trigger lives change callback
            if (this.onLivesChange) {
                this.onLivesChange(this.currentPlayer, this.lives[this.currentPlayer])
            }
        }

        // ALWAYS check for game end conditions first
        if (this.isGameActive) {
            // Check if there is a winner
            const winner = this.BOARD.checkWinner()
            if (winner) {
                this.endGame(winner)
                return
            }
            
            // If a player has no lives left, stop the game
            if (this.lives[this.currentPlayer] <= 0) {
                this.isGameActive = false
                console.log(`${this.currentPlayer} has lost all lives.`)
                this.switchPlayer()
                this.endGame(`${this.currentPlayer} wins! Game over.`)
                return
            }
            
            // Check for stalemate/stuck conditions
            if (this.BOARD.isGameStuck(this.lives[this.BOARD.PLAYER1], this.lives[this.BOARD.PLAYER2])) {
                this.endGame("Game ended - no more moves possible!")
                return
            }
            
            // Otherwise, switch to the next player and start the timer
            this.switchPlayer()
            console.log(`Next player's turn: ${this.currentPlayer}`)
            this.randomizedBombPlacement()
            
            // Unfreeze board for the new player
            this.unfreezeBoard()
            
            // Start timer for next turn
            this.startTurnTimer()
        }
        
        this.updateUI()
    }

    /**
     * Switch current player
     */
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.BOARD.PLAYER1 ? this.BOARD.PLAYER2 : this.BOARD.PLAYER1
        if (this.onPlayerChange) {
            this.onPlayerChange(this.currentPlayer)
        }
    }

    /**
     * ENHANCED Timer management with pause/resume support
     */
    startTurnTimer(resumeTime = null) {
        this.pauseTimer() // Clear any existing timer
        this.inputCancelled = false
        
        // Use remaining time if resuming, otherwise use full time
        let timeRemaining = resumeTime !== null ? resumeTime : this.TURN_TIME_LIMIT
        this.timerStartTime = Date.now()
        
        // Update timer display immediately
        this.updateTimerDisplay(timeRemaining)
        
        // Timer countdown interval
        const countdownInterval = setInterval(() => {
            if (this.inputCancelled || this.isPaused) {
                clearInterval(countdownInterval)
                return
            }
            
            timeRemaining = (resumeTime !== null ? resumeTime : this.TURN_TIME_LIMIT) - (Date.now() - this.timerStartTime)
            
            if (timeRemaining <= 0) {
                clearInterval(countdownInterval)
                this.handleTimerExpired()
            } else {
                this.updateTimerDisplay(timeRemaining)
            }
        }, 100) // Update every 100ms for smooth animation
        
        // Store timer references
        this.timerID = {
            timeout: setTimeout(() => {
                if (!this.inputCancelled && !this.isPaused) {
                    clearInterval(countdownInterval)
                    this.handleTimerExpired()
                }
            }, timeRemaining),
            interval: countdownInterval,
            startTime: this.timerStartTime,
            originalDuration: resumeTime !== null ? resumeTime : this.TURN_TIME_LIMIT
        }
    }

    /**
     * ENHANCED: Handle timer expiration with board freezing
     */
    handleTimerExpired() {
        if (this.inputCancelled || this.isPaused || !this.isGameActive) {
            console.log('Timer expiration ignored - game state changed')
            return
        }
        
        console.log('⏰ Time expired! Moving to next player...')
        this.inputCancelled = true
        this.pauseTimer() // Ensure timer is fully stopped
        this.triggerEffect('timer-expired')
        
        // Freeze board immediately when timer expires
        this.freezeBoard('timer-expired')
        
        // Force next turn with penalty after brief delay
        setTimeout(() => {
            this.nextTurn(true, true) // Penalty for timeout, called by timer
        }, 100)
    }

    /**
     * Pause timer - ENHANCED
     */
    pauseTimer() {
        if (this.timerID) {
            // Calculate remaining time when pausing
            if (this.timerID.startTime && this.timerID.originalDuration) {
                const elapsed = Date.now() - this.timerID.startTime
                this.pausedTimeRemaining = Math.max(0, this.timerID.originalDuration - elapsed)
            }
            
            if (this.timerID.timeout) clearTimeout(this.timerID.timeout)
            if (this.timerID.interval) clearInterval(this.timerID.interval)
            this.timerID = null
        }
        this.inputCancelled = true
    }

    /**
     * ENHANCED Toggle pause state with proper timer resume
     */
    togglePause() {
        if (!this.isGameActive) return
        
        this.isPaused = !this.isPaused
        
        if (this.isPaused) {
            this.pauseTimer()
            this.freezeBoard('paused')
            this.showPausedOverlay()
            console.log('⏸️ Game paused - timer saved at:', this.pausedTimeRemaining)
        } else {
            this.unfreezeBoard()
            this.hidePausedOverlay()
            // FIXED: Resume with remaining time instead of restarting
            this.startTurnTimer(this.pausedTimeRemaining > 0 ? this.pausedTimeRemaining : this.TURN_TIME_LIMIT)
            console.log('▶️ Game resumed - timer resumed from:', this.pausedTimeRemaining)
        }
        
        this.updateUI()
    }

    /**
     * Show paused overlay
     */
    showPausedOverlay() {
        const pausedOverlay = document.getElementById('pausedOverlay')
        if (pausedOverlay) {
            pausedOverlay.classList.add('active')
            // Click anywhere to resume
            pausedOverlay.addEventListener('click', () => this.togglePause(), { once: true })
        }
    }

    /**
     * Hide paused overlay
     */
    hidePausedOverlay() {
        const pausedOverlay = document.getElementById('pausedOverlay')
        if (pausedOverlay) {
            pausedOverlay.classList.remove('active')
        }
    }

    /**
     * Random bomb placement - ENHANCED to hide bombs initially
     */
    randomizedBombPlacement() {
        const randomizeGenerator = () => Math.floor(Math.random() * 3)
        const bombCount = randomizeGenerator()
        if (bombCount === 0) return false

        let attempts = 0
        let placedBombs = 0
        let maxAttempts = bombCount * 2

        while (placedBombs < bombCount && attempts < maxAttempts) {
            const row = randomizeGenerator()
            const col = randomizeGenerator()
            if (this.BOARD.isCellEmpty(row, col)) {
                this.BOARD.placeMark(row, col, this.BOARD.BOMB)
                placedBombs++
                console.log(`Bomb placed at (${row}, ${col}) - hidden until clicked`)
            }
            attempts++
        }
        
        // IMPORTANT: Don't update UI here - bombs should remain hidden
        // Only update other parts of the UI
        this.updateLives()
        this.updateTimer()
        this.updateControls()
    }

    /**
     * Update all UI elements
     */
    updateUI() {
        this.updateBoard()
        this.updateLives()
        this.updateTimer()
        this.updateControls()
    }

    /**
     * ENHANCED Update board display - with hidden bombs and freeze states
     */
    updateBoard() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.cellElements[row][col]
                if (!cell) continue

                const cellState = this.BOARD.getCellState(row, col)
                
                // ENHANCED: Hide bombs until clicked
                if (cellState === this.BOARD.BOMB) {
                    // Show as empty but mark as bomb internally
                    cell.textContent = ''
                    cell.className = 'cell clickable'
                    // Add a subtle visual hint (optional)
                    cell.setAttribute('data-has-bomb', 'true')
                } else {
                    cell.removeAttribute('data-has-bomb')
                    const cellData = this.BOARD.getCellDisplayData(row, col)
                    
                    // Update cell content
                    cell.textContent = cellData.text
                    
                    // Clear existing classes and add new ones
                    cell.className = 'cell'
                    if (cellData.className) {
                        cell.classList.add(cellData.className)
                    }
                    
                    // Add click state for interactive cells (only if board not frozen)
                    if ((cellData.isEmpty || cellState === this.BOARD.CACHE) && !this.isBoardFrozen) {
                        cell.classList.add('clickable')
                    }
                }

                // ENHANCED: Apply frozen state if board is frozen
                if (this.isBoardFrozen) {
                    cell.setAttribute('data-frozen', 'true')
                } else {
                    cell.removeAttribute('data-frozen')
                }
            }
        }
        
        // Highlight winning cells if game is over
        if (!this.isGameActive) {
            const winningCells = this.BOARD.getWinningCells()
            winningCells.forEach(([row, col]) => {
                const cell = this.cellElements[row][col]
                if (cell) {
                    cell.classList.add('winning-cell')
                }
            })
        }
    }

    /**
     * Update lives display
     */
    updateLives() {
        [this.BOARD.PLAYER1, this.BOARD.PLAYER2].forEach(player => {
            const livesData = this.livesElements[player]
            if (!livesData || !livesData.hearts) return

            const currentLives = this.lives[player]
            
            // Update hearts
            livesData.hearts.forEach((heart, index) => {
                if (index < currentLives) {
                    heart.textContent = '❤️'
                    heart.classList.remove('lost')
                } else {
                    heart.textContent = '💔'
                    heart.classList.add('lost')
                }
            })

            // Highlight active player
            if (livesData.container) {
                if (player === this.currentPlayer && this.isGameActive && !this.isPaused) {
                    livesData.container.classList.add('active')
                } else {
                    livesData.container.classList.remove('active')
                }
            }
        })
    }

    /**
     * Update timer display
     */
    updateTimer() {
        if (!this.timerElements.playerName || !this.timerElements.countdown) return

        // Update player name
        this.timerElements.playerName.textContent = `Player ${this.currentPlayer}'s Turn`
        
        // Show/hide timer based on game state
        if (this.timerElements.container) {
            if (this.isGameActive && !this.isPaused) {
                this.timerElements.container.classList.remove('hidden')
            } else {
                this.timerElements.container.classList.add('hidden')
            }
        }
    }

    /**
     * Update timer display with remaining time
     */
    updateTimerDisplay(timeRemaining) {
        if (!this.timerElements.countdown || !this.timerElements.progressBar) return

        const seconds = Math.max(0, timeRemaining / 1000)
        const progress = Math.max(0, timeRemaining / this.TURN_TIME_LIMIT)

        // Update countdown text
        this.timerElements.countdown.textContent = seconds.toFixed(1)

        // Update progress bar
        this.timerElements.progressBar.style.width = `${progress * 100}%`

        // Add warning classes
        const timerDisplay = document.querySelector('.timer-display')
        if (timerDisplay) {
            timerDisplay.classList.toggle('warning', seconds <= 2)
            timerDisplay.classList.toggle('critical', seconds <= 1)
        }
        
        // Update progress bar classes
        this.timerElements.progressBar.classList.toggle('warning', seconds <= 2)
        this.timerElements.progressBar.classList.toggle('critical', seconds <= 1)
    }

    /**
     * Update control buttons
     */
    updateControls() {
        // Update pause button
        if (this.controlButtons.pause) {
            this.controlButtons.pause.textContent = this.isPaused ? '▶️ RESUME' : '⏸️ PAUSE'
            this.controlButtons.pause.disabled = !this.isGameActive
        }
    }

    /**
     * Show feedback for occupied cell
     */
    showCellOccupiedFeedback(row, col, cellValue) {
        const playerName = cellValue === this.BOARD.PLAYER1 ? 'X' : 'O'
        console.log(`Cell (${row}, ${col}) is already occupied by ${playerName}. Try again.`)
        
        // Visual feedback
        const cell = this.cellElements[row][col]
        if (cell) {
            cell.classList.add('occupied-feedback')
            setTimeout(() => cell.classList.remove('occupied-feedback'), 1000)
        }
    }

    /**
     * Trigger visual effects
     */
    triggerEffect(effectType, row = null, col = null) {
        console.log(`🎬 Effect: ${effectType} at (${row}, ${col})`)
        
        // Simple effect implementation
        if (row !== null && col !== null) {
            const cell = this.cellElements[row][col]
            if (cell) {
                switch (effectType) {
                    case 'life-saved':
                        cell.classList.add('glow-success')
                        setTimeout(() => cell.classList.remove('glow-success'), 1000)
                        break
                    case 'life-lost':
                        cell.classList.add('glow-error')
                        setTimeout(() => cell.classList.remove('glow-error'), 1000)
                        break
                    case 'timer-expired':
                        document.body.classList.add('screen-shake')
                        setTimeout(() => document.body.classList.remove('screen-shake'), 500)
                        break
                }
            }
        }
    }

    /**
     * End game
     */
    endGame(message) {
        this.isGameActive = false
        this.pauseTimer()
        this.unfreezeBoard() // Make sure board is unfrozen when game ends
        
        console.log('🎮 Game Over!')
        console.log(message)
        
        // Trigger game end callback
        if (this.onGameEnd) {
            this.onGameEnd(message)
        }
        
        this.updateUI()
    }
}

// Expose Game class for use in other modules
window.Game = Game