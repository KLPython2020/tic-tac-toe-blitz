// app.js - FIXED: All three critical issues resolved
// 
// GAME STATE MANAGEMENT:
// 1. NEW GAME (🎮 NEW): Clear ALL stats and start completely fresh
// 2. RESET GAME (🔄 RESET): Restart current session, keep current game stats
// 3. END GAME (🛑 END): Return to start screen, keep current session stats
//
class TicTacToeBlitzApp {
    constructor() {
        this.game = null
        this.audioSystem = null
        this.isInitialized = false
        
        // FIXED Issue B: Enhanced game statistics with proper game vs session tracking
        this.stats = {
            // Session-persistent stats (saved to localStorage)
            gamesPlayed: 0,
            playerXWins: 0,
            playerOWins: 0,
            ties: 0,
            
            // FIXED Issue B: Per-game question stats (reset each game, NOT saved)
            currentGameStats: {
                X: {
                    questionsCorrect: 0,
                    questionsWrong: 0
                },
                O: {
                    questionsCorrect: 0,
                    questionsWrong: 0
                }
            }
        }
        
        // Application settings - ENHANCED with music
        this.settings = {
            soundEnabled: true,
            timerSeconds: 5,
            startingLives: 3,
            difficulty: 'mixed',
            animationsEnabled: true,
            musicEnabled: false
        }
        
        // DOM elements
        this.elements = {
            gameOverModal: null,
            settingsModal: null,
            startScreen: null
        }
    }

    /**
     * Initialize the entire application
     */
    async init() {
        try {
            console.log('🚀 Initializing Tic-Tac-Toe Blitz...')
            
            // Wait for DOM to be ready
            await this.waitForDOM()
            
            // Initialize components
            await this.initializeComponents()
            
            // Bind global events
            this.bindGlobalEvents()
            
            // Set up game callbacks
            this.setupGameCallbacks()
            
            // Load saved settings and stats
            this.loadSettings()
            this.loadStats()
            
            console.log('⚙️ Settings after initialization:', this.settings)
            
            // Update stats display
            this.updateStatsDisplay()
            
            // Initialize hearts display with default settings
            this.updateLivesDisplay()
            
            // Show start screen
            this.showStartScreen()
            
            this.isInitialized = true
            console.log('✅ Tic-Tac-Toe Blitz initialized successfully!')
            console.log('📊 Initial stats:', this.stats)
            
        } catch (error) {
            console.error('❌ Failed to initialize game:', error)
            this.showErrorMessage('Failed to initialize game. Please refresh the page.')
        }
    }

    /**
     * Wait for DOM content to be loaded
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve)
            } else {
                resolve()
            }
        })
    }

    /**
     * Initialize all game components
     */
    async initializeComponents() {
        // Initialize audio system
        if (typeof AudioSystem !== 'undefined') {
            this.audioSystem = new AudioSystem()
            await this.audioSystem.init()
        }

        // Bind DOM elements first
        this.bindDOMElements()
        
        // Don't initialize game here - wait until game actually starts
        // Game will be created in startNewGame() when container is visible
    }

    /**
     * UPDATED: Bind DOM elements to app with new player stat elements
     */
    bindDOMElements() {
        this.elements = {
            gameOverModal: document.getElementById('gameOverModal'),
            settingsModal: document.getElementById('settingsModal'),
            startScreen: document.getElementById('startScreen'),
            
            // NEW: Player area elements
            playerXArea: document.getElementById('playerXArea'),
            playerOArea: document.getElementById('playerOArea'),
            
            // Game over modal elements
            gameOverMessage: document.getElementById('gameOverMessage'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            newGameBtn: document.getElementById('newGameBtn'),
            newGameFromModalBtn: document.getElementById('newGameFromModalBtn'),
            
            // Settings modal elements
            settingsBtn: document.getElementById('settingsBtn'),
            cancelSettingsBtn: document.getElementById('cancelSettingsBtn'),
            closeSettingsXBtn: document.getElementById('closeSettingsXBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            soundToggle: document.getElementById('soundToggle'),
            timerDurationSelect: document.getElementById('timerDurationSelect'),
            startingLivesSelect: document.getElementById('startingLivesSelect'),
            difficultySelect: document.getElementById('difficultySelect'),
            animationsToggle: document.getElementById('animationsToggle'),
            musicToggle: document.getElementById('musicToggle'),
            
            // Start screen elements
            startGameBtn: document.getElementById('startGameBtn'),
            quickStartBtn: document.getElementById('quickStartBtn'),
            
            // UPDATED: Statistics elements (moved to different locations)
            // Global stats (header)
            gamesPlayed: document.getElementById('gamesPlayed'),
            ties: document.getElementById('ties'),
            
            // NEW: Player-specific stats elements
            playerXWins: document.getElementById('playerXWins'),
            playerOWins: document.getElementById('playerOWins'),
            playerXCorrect: document.getElementById('playerXCorrect'),
            playerXWrong: document.getElementById('playerXWrong'),
            playerOCorrect: document.getElementById('playerOCorrect'),
            playerOWrong: document.getElementById('playerOWrong'),
            
            // Control buttons
            newGameBtn: document.getElementById('newGameBtn'),
            startGameBtn: document.getElementById('startGameBtn'),
            resetGameBtn: document.getElementById('resetGameBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            soundBtn: document.getElementById('soundBtn'),
            endGameBtn: document.getElementById('endGameBtn')
        }
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Settings modal
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showSettings())
        }
        if (this.elements.cancelSettingsBtn) {
            this.elements.cancelSettingsBtn.addEventListener('click', () => this.hideSettings())
        }
        if (this.elements.closeSettingsXBtn) {
            this.elements.closeSettingsXBtn.addEventListener('click', () => this.hideSettings())
        }
        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettingsWithFeedback())
        }
        
        // Settings modal backdrop
        const settingsModalBackdrop = document.getElementById('settingsModalBackdrop')
        if (settingsModalBackdrop) {
            settingsModalBackdrop.addEventListener('click', () => this.hideSettings())
        }
        
        // Question modal backdrop - treat as outside click
        const questionModalBackdrop = document.getElementById('questionModalBackdrop')
        if (questionModalBackdrop) {
            questionModalBackdrop.addEventListener('click', () => this.handleQuestionBackdropClick())
        }
        


        // Start Game button (on game screen)
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => this.startGameFromGameScreen())
        }
        
        // End Game button
        if (this.elements.endGameBtn) {
            this.elements.endGameBtn.addEventListener('click', () => this.endCurrentGame())
        }
    
        // Sound controls
        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked
                this.applySound()
            })
        }
        
        // Lives setting - disable during active games or warn about restart
        if (this.elements.startingLivesSelect) {
            this.elements.startingLivesSelect.addEventListener('change', (e) => {
                const newLives = parseInt(e.target.value)
                if (this.game && this.game.isGameActive) {
                    // Game is active - warn user about restart
                    this.warnAboutLivesChange(newLives)
                } else {
                    // No active game - safe to change
                    this.updateStartingLives(newLives)
                }
            })
        }
        
        // Music controls
        if (this.elements.musicToggle) {
            this.elements.musicToggle.addEventListener('change', (e) => {
                this.settings.musicEnabled = e.target.checked
                this.applyMusic()
            })
        }
        
        // Main sound button
        if (this.elements.soundBtn) {
            this.elements.soundBtn.addEventListener('click', () => this.toggleMainSoundButton())
        }
    
        // Timer controls
        if (this.elements.timerDurationSelect) {
            this.elements.timerDurationSelect.addEventListener('change', (e) => {
                this.settings.timerSeconds = parseInt(e.target.value)
                console.log(`⏰ Timer set to ${this.settings.timerSeconds} seconds`)
            })
        }
        
        // Other settings
        if (this.elements.startingLivesSelect) {
            this.elements.startingLivesSelect.addEventListener('change', (e) => {
                const newLives = parseInt(e.target.value)
                console.log(`❤️ Settings modal starting lives changed to ${newLives}`)
                this.updateStartingLives(newLives)
            })
        }
        
        if (this.elements.difficultySelect) {
            this.elements.difficultySelect.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value
            })
        }
        
        if (this.elements.animationsToggle) {
            this.elements.animationsToggle.addEventListener('change', (e) => {
                this.settings.animationsEnabled = e.target.checked
                this.applyAnimations()
            })
        }
    
        // Game over modal buttons
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.addEventListener('click', () => {
                console.log('🔄 Play Again button clicked from game over modal')
                this.playAgain()
            })
        }
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => this.startNewGame())
        }
        if (this.elements.newGameFromModalBtn) {
            this.elements.newGameFromModalBtn.addEventListener('click', () => this.startNewGame())
        }
        
        // Game over modal backdrop click handler
        const gameOverModalBackdrop = document.getElementById('gameOverModalBackdrop')
        if (gameOverModalBackdrop) {
            gameOverModalBackdrop.addEventListener('click', () => {
                console.log('🎭 Game over modal backdrop clicked')
                this.hideGameOverModal()
            })
        }

        // Game control buttons
        if (this.elements.resetGameBtn) {
            this.elements.resetGameBtn.addEventListener('click', () => this.resetCurrentGame())
        }
    
        // Start screen buttons
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => this.startFirstGame())
        }
        if (this.elements.quickStartBtn) {
            this.elements.quickStartBtn.addEventListener('click', () => this.quickStart())
        }

        // Start screen settings
        this.bindStartScreenSettings()
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeyboard(e))
    
        // Modal backdrop clicks
        document.addEventListener('click', (e) => this.handleModalBackdropClick(e))
    
        // Window beforeunload (save progress)
        window.addEventListener('beforeunload', () => this.saveProgress())

        // First user interaction to enable audio context
        document.addEventListener('click', () => this.enableAudioContext(), { once: true })
    }

    /**
     * End Current Game manually - Always works and returns to start screen
     */
    endCurrentGame() {
        // Always show confirmation modal, regardless of game state
        this.showEndGameConfirmation()
    }

    /**
     * Show custom end game confirmation modal
     */
    showEndGameConfirmation() {
        // Pause the game when confirmation modal opens
        if (this.game && this.game.isGameActive) {
            this.game.pauseGame()
        }
        
        // Create confirmation modal
        const confirmationModal = document.createElement('div')
        confirmationModal.className = 'modal confirmation-modal active'
        confirmationModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content confirmation-content">
                <div class="confirmation-header">
                    <h3>⚠️ End Game?</h3>
                    <p>Are you sure you want to end the current game?</p>
                </div>
                
                <div class="confirmation-warning">
                    <div class="warning-item">🎮 End the current game session</div>
                    <div class="warning-item">📊 Keep current session stats</div>
                    <div class="warning-item">🏠 Return to the start screen</div>
                </div>
                
                <div class="confirmation-buttons">
                    <button class="control-btn cancel-btn" id="cancelEndGameBtn" type="button">
                        ❌ CANCEL
                    </button>
                    <button class="control-btn end-game-btn" id="confirmEndGameBtn" type="button">
                        🛑 END GAME
                    </button>
                </div>
            </div>
        `
        
        // Add to body
        document.body.appendChild(confirmationModal)
        
        // Bind event listeners
        const cancelBtn = confirmationModal.querySelector('#cancelEndGameBtn')
        const confirmBtn = confirmationModal.querySelector('#confirmEndGameBtn')
        
        // Handle backdrop click
        const backdrop = confirmationModal.querySelector('.modal-backdrop')
        backdrop.addEventListener('click', () => {
            this.closeConfirmationModal(confirmationModal)
        })
        
        cancelBtn.addEventListener('click', () => {
            this.closeConfirmationModal(confirmationModal)
        })
        
        confirmBtn.addEventListener('click', () => {
            this.closeConfirmationModal(confirmationModal)
            this.endGameAndShowWinner()
        })
        
        // Focus on cancel button for safety
        cancelBtn.focus()
        
        console.log('⚠️ End game confirmation modal displayed - Game paused')
    }

    /**
     * Close confirmation modal and resume game if cancelled
     */
    closeConfirmationModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal)
        }
        
        // Resume the game if it was paused by the confirmation modal
        if (this.game && this.game.isPaused) {
            this.game.resumeGame()
            console.log('🔄 Game resumed after cancelling end game')
        }
    }

    /**
     * End game, show ultimate winner, and return to start screen
     */
    endGameAndShowWinner() {
        // End the current game
        this.game.endGame('Game ended manually')
        
        // Determine ultimate winner
        const ultimateWinner = this.determineUltimateWinner()
        
        // Show winner announcement with interactive options
        this.showUltimateWinnerAnnouncement(ultimateWinner)
        
        // Don't reset game state yet - wait for user choice
        // Game state will be reset when user chooses NEW GAME or START SCREEN
        
        console.log('🛑 Game ended manually by user')
    }

    /**
     * Determine the ultimate winner based on total wins
     */
    determineUltimateWinner() {
        const { playerXWins, playerOWins, ties } = this.stats
        
        if (playerXWins > playerOWins) {
            return { player: 'X', wins: playerXWins, message: 'Player X is the Ultimate Winner!' }
        } else if (playerOWins > playerXWins) {
            return { player: 'O', wins: playerOWins, message: 'Player O is the Ultimate Winner!' }
        } else if (playerXWins === playerOWins && playerXWins > 0) {
            return { player: 'tie', wins: playerXWins, message: 'It\'s a tie! Both players are equally skilled!' }
        } else {
            return { player: 'none', wins: 0, message: 'No games completed yet!' }
        }
    }

    /**
     * Show ultimate winner announcement with interactive options
     */
    showUltimateWinnerAnnouncement(winner) {
        // Capture current stats before any modifications
        const currentStats = {
            playerXWins: this.stats.playerXWins,
            playerOWins: this.stats.playerOWins,
            ties: this.stats.ties
        }
        
        // Create winner announcement modal (not overlay)
        const winnerModal = document.createElement('div')
        winnerModal.className = 'modal winner-modal active'
        winnerModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content winner-content">
                <div class="winner-header">
                    <div class="winner-title">🏆 GAME ENDED 🏆</div>
                    <div class="winner-message">${winner.message}</div>
                </div>
                
                <div class="winner-stats">
                    <div class="winner-stat">
                        <span class="stat-label">Player X Wins:</span>
                        <span class="stat-value">${currentStats.playerXWins}</span>
                    </div>
                    <div class="winner-stat">
                        <span class="stat-label">Player O Wins:</span>
                        <span class="stat-value">${currentStats.playerOWins}</span>
                    </div>
                    <div class="winner-stat">
                        <span class="stat-label">Ties:</span>
                        <span class="stat-value">${currentStats.ties}</span>
                    </div>
                </div>
                
                <div class="winner-actions">
                    <button class="control-btn new-game-btn" id="winnerNewGameBtn" type="button">
                        🎮 NEW GAME
                    </button>
                    <button class="control-btn start-screen-btn" id="winnerStartScreenBtn" type="button">
                        🏠 START SCREEN
                    </button>
                </div>
            </div>
        `
        
        // Add to body
        document.body.appendChild(winnerModal)
        
        // Bind event listeners
        const newGameBtn = winnerModal.querySelector('#winnerNewGameBtn')
        const startScreenBtn = winnerModal.querySelector('#winnerStartScreenBtn')
        const backdrop = winnerModal.querySelector('.modal-backdrop')
        
        // Handle backdrop click - do nothing (force user to make a choice)
        backdrop.addEventListener('click', (e) => {
            e.stopPropagation() // Prevent closing on backdrop click
        })
        
        // New Game button - start fresh game
        newGameBtn.addEventListener('click', () => {
            console.log('🏆 Winner modal: NEW GAME button clicked')
            console.log('📊 Stats before reset:', this.stats)
            winnerModal.remove()
            // Reset game state before starting new game
            this.resetGameState()
            this.startNewGame()
        })
        
        // Start Screen button - return to main menu
        startScreenBtn.addEventListener('click', () => {
            console.log('🏆 Winner modal: START SCREEN button clicked')
            console.log('📊 Stats before reset:', this.stats)
            winnerModal.remove()
            // Reset game state before returning to start screen
            this.resetGameState()
            this.showStartScreen()
        })
        
        // Focus on New Game button for quick access
        newGameBtn.focus()
        
        // Play victory sound
        if (winner.player !== 'none') {
            this.playSound('victory')
        }
        
        console.log('🏆 Winner announcement modal displayed with interactive options')
    }

    /**
     * Reset game state for new game
     */
    resetGameState() {
        // Reset current game stats
        this.stats.currentGameStats = {
            X: { questionsCorrect: 0, questionsWrong: 0 },
            O: { questionsCorrect: 0, questionsWrong: 0 }
        }
        
        // Update display
        this.updatePlayerStatsDisplay('X')
        this.updatePlayerStatsDisplay('O')
        
        // Reset game instance
        if (this.game) {
            this.game = null
        }
        
        console.log('🔄 Game state reset')
    }

    /**
     * Enable audio context on first user interaction
     */
    async enableAudioContext() {
        if (this.audioSystem) {
            await this.audioSystem.resumeContext()
            // Start music if enabled
            if (this.settings.musicEnabled) {
                this.audioSystem.setMusicEnabled(true)
            }
        }
    }

    /**
     * Set up game event callbacks
     */
    setupGameCallbacks() {
        if (!this.game) return

        // Game end callback
        this.game.onGameEnd = (message) => {
            this.handleGameEnd(message)
        }

        // Player change callback - FIXED Issue A: Ensure initial highlighting
        this.game.onPlayerChange = (newPlayer) => {
            this.handlePlayerChange(newPlayer)
        }

        // Lives change callback
        this.game.onLivesChange = (player, lives) => {
            this.handleLivesChange(player, lives)
        }
    }

    /**
     * Show start screen
     */
    showStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.add('active')
            // Ensure game container is hidden
            const gameContainer = document.querySelector('.game-container')
            if (gameContainer) {
                gameContainer.style.display = 'none'
            }
            // Sync start screen settings with current settings
            this.syncStartScreenSettings()
        }
    }

    /**
     * Hide start screen
     */
    hideStartScreen() {
        if (this.elements.startScreen) {
            this.elements.startScreen.classList.remove('active')
            // Show game container
            const gameContainer = document.querySelector('.game-container')
            if (gameContainer) {
                gameContainer.style.display = 'flex'
            }
        }
    }

    /**
     * Start first game with intro sequence
     */
    async startFirstGame() {
        try {
            console.log('🎮 startFirstGame() called')
            console.log('⚙️ Current settings before save:', this.settings)
            
            // Save start screen settings before starting game
            this.saveSettings()
            
            console.log('⚙️ Settings after save:', this.settings)
            console.log('❤️ Lives setting after save:', this.settings.startingLives)
            console.log('⚙️ Settings saved, now hiding start screen')
            this.hideStartScreen()
            
            // Show loading briefly for effect
            const loading = document.getElementById('loadingOverlay')
            if (loading) {
                loading.style.display = 'flex'
                loading.classList.add('active')
            }
            
            // Delay for intro effect
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            if (loading) {
                loading.classList.remove('active')
                loading.style.display = 'none'
            }
            
            await this.startNewGame()
            this.playSound('game-start')
            
            // Show helpful intro message
            this.showNotification('Welcome to Tic-Tac-Toe Blitz! Hit bombs for knowledge challenges!', 'info', 4000)
            
        } catch (error) {
            console.error('Error starting first game:', error)
            this.showErrorMessage('Failed to start game. Please try again.')
        }
    }

    /**
     * Quick start (minimal intro)
     */
    async quickStart() {
        // Save start screen settings before starting game
        this.saveSettings()
        
        this.hideStartScreen()
        await this.startNewGame()
        this.showNotification('Game started!', 'success', 2000)
    }
    
    /**
     * Start game from game screen (keep stats, use current settings)
     */
    async startGameFromGameScreen() {
        try {
            console.log('🚀 startGameFromGameScreen() called')
            
            // Hide any modals that might be open
            this.hideGameOverModal()
            this.hideSettings()
            
            // Create new game instance if needed
            if (!this.game) {
                console.log('🎮 Creating new game instance for game screen start')
                this.game = new Game()
                await this.game.initUI()
                this.setupGameCallbacks()
            }
            
            // Apply current settings to new game
            this.applySettingsToGame()
            
            // Update lives display to match settings
            this.updateLivesDisplay()
            
            // Re-bind UI elements after lives display update
            if (this.game.bindUIElements) {
                this.game.bindUIElements()
            }
            
            // Re-bind hearts specifically after they've been recreated
            if (this.game.rebindHearts) {
                this.game.rebindHearts()
            }
            
            // Start the game
            await this.game.startNewGame()
            this.playSound('game-start')
            
            // Show notification
            this.showNotification('New game started!', 'success', 2000)
            
        } catch (error) {
            console.error('Error starting game from game screen:', error)
            this.showErrorMessage('Failed to start game. Please try again.')
        }
    }

    /**
     * Start a completely new game session (clear ALL stats and start fresh)
     * This is different from resetCurrentGame() which restarts the current session
     */
    async startNewGame() {
        try {
            console.log('🎮 startNewGame() called')
            console.log('📊 Stats before clearing:', this.stats)
            
            this.hideGameOverModal()
            
            // Clear ALL statistics for fresh start
            this.clearAllStatistics()
            
            console.log('📊 Stats after clearing:', this.stats)
            
            // Create new game instance
            this.game = new Game()
            console.log('🎮 Game instance created with initial lives:', this.game.lives)
            
            // Initialize the game UI AFTER container is visible
            await this.game.initUI()
            this.setupGameCallbacks()
            
            // Apply current settings to new game
            console.log('⚙️ About to apply settings to game...')
            this.applySettingsToGame()
            
            // Update lives display first to create new hearts
            console.log('❤️ About to update lives display...')
            this.updateLivesDisplay()
            
            // Re-bind UI elements after updating lives to get new heart references
            console.log('🔗 About to bind UI elements...')
            if (this.game.bindUIElements) {
                this.game.bindUIElements()
                console.log('🔗 UI elements bound successfully')
            } else {
                console.warn('⚠️ bindUIElements method not found on game instance')
            }
            
            // Also re-bind hearts specifically after they've been recreated
            if (this.game.rebindHearts) {
                this.game.rebindHearts()
                console.log('🔗 Hearts re-bound successfully')
            }
            
            await this.game.startNewGame()
            this.playSound('new-game')
            
            // FIXED Issue A: Force initial player highlighting after game starts
            this.handlePlayerChange(this.game.currentPlayer)
            
            // Update stats display
            this.updateStatsDisplay()
            
            console.log('🎮 New game started with cleared stats!')
            console.log('📊 Final Statistics:', this.stats)
        } catch (error) {
            console.error('Error starting new game:', error)
            this.showErrorMessage('Failed to start new game.')
        }
    }

    /**
     * FIXED Issue B: Reset only current game question stats
     */
    resetCurrentGameStats() {
        this.stats.currentGameStats = {
            X: {
                questionsCorrect: 0,
                questionsWrong: 0
            },
            O: {
                questionsCorrect: 0,
                questionsWrong: 0
            }
        }
        console.log('🔄 Current game question stats reset')
    }

    /**
     * Reset current game (restart session, keep stats)
     */
    async resetCurrentGame() {
        if (!this.game || !this.game.isGameActive) {
            this.showNotification('No active game to reset', 'warning', 2000)
            return
        }

        try {
            // Show confirmation modal for reset
            this.showResetGameConfirmation()
        } catch (error) {
            console.error('Error resetting game:', error)
            this.showErrorMessage('Failed to reset game.')
        }
    }

    /**
     * Show reset game confirmation modal
     */
    showResetGameConfirmation() {
        // Pause the game when confirmation modal opens
        if (this.game && this.game.isGameActive) {
            this.game.pauseGame()
        }
        
        // Create confirmation modal
        const confirmationModal = document.createElement('div')
        confirmationModal.className = 'modal confirmation-modal active'
        confirmationModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content confirmation-content">
                <div class="confirmation-header">
                    <h3>🔄 Reset Game?</h3>
                    <p>Are you sure you want to reset the current game?</p>
                </div>
                
                <div class="confirmation-info">
                    <div class="info-item">🎮 Restart current session</div>
                    <div class="info-item">📊 Keep current session stats</div>
                    <div class="info-item">🔄 Fresh game board</div>
                </div>
                
                <div class="confirmation-buttons">
                    <button class="control-btn cancel-btn" id="cancelResetBtn" type="button">
                        ❌ CANCEL
                    </button>
                    <button class="control-btn reset-btn" id="confirmResetBtn" type="button">
                        🔄 RESET GAME
                    </button>
                </div>
            </div>
        `
        
        // Add to body
        document.body.appendChild(confirmationModal)
        
        // Bind event listeners
        const cancelBtn = confirmationModal.querySelector('#cancelResetBtn')
        const confirmBtn = confirmationModal.querySelector('#confirmResetBtn')
        
        // Handle backdrop click
        const backdrop = confirmationModal.querySelector('.modal-backdrop')
        backdrop.addEventListener('click', () => {
            this.closeResetConfirmationModal(confirmationModal)
        })
        
        cancelBtn.addEventListener('click', () => {
            this.closeResetConfirmationModal(confirmationModal)
        })
        
        confirmBtn.addEventListener('click', () => {
            this.closeResetConfirmationModal(confirmationModal)
            this.executeResetGame()
        })
        
        // Focus on cancel button for safety
        cancelBtn.focus()
        
        console.log('🔄 Reset game confirmation modal displayed - Game paused')
    }

    /**
     * Close reset confirmation modal and resume game if cancelled
     */
    closeResetConfirmationModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal)
        }
        
        // Resume the game if it was paused by the confirmation modal
        if (this.game && this.game.isPaused) {
            this.game.resumeGame()
            console.log('🔄 Game resumed after cancelling reset')
        }
    }

    /**
     * Execute the reset game action (restart current session, keep stats)
     */
    async executeResetGame() {
        try {
            console.log('🔄 executeResetGame: Starting reset process...')
            console.log('📊 Stats before reset:', this.stats)
            
            // Reset only current game question stats (keep persistent stats)
            this.resetCurrentGameStats()
            console.log('📊 Stats after resetCurrentGameStats:', this.stats)
            
            // Apply current settings to new game
            this.applySettingsToGame()
            
            // Update lives display to match settings
            this.updateLivesDisplay()
            
            // Re-bind UI elements after lives display update
            if (this.game.bindUIElements) {
                this.game.bindUIElements()
            }
            
            // Re-bind hearts specifically after they've been recreated
            if (this.game.rebindHearts) {
                this.game.rebindHearts()
            }
            
            // Start fresh game with same settings and preserved stats
            await this.game.startNewGame()
            this.playSound('new-game')
            
            // Force initial player highlighting after game starts
            this.handlePlayerChange(this.game.currentPlayer)
            
            // Update stats display
            this.updateStatsDisplay()
            
            console.log('📊 Stats after reset complete:', this.stats)
            console.log('🔄 Game reset successfully - stats preserved!')
            this.showNotification('Game reset successfully - stats preserved!', 'success', 2000)
        } catch (error) {
            console.error('Error executing reset game:', error)
            this.showErrorMessage('Failed to reset game.')
        }
    }

    /**
     * Apply settings to game
     */
    applySettingsToGame() {
        if (this.game) {
            console.log('⚙️ Applying settings to game')
            console.log('⏰ Timer setting:', this.settings.timerSeconds, 'seconds')
            console.log('❤️ Lives setting:', this.settings.startingLives, 'lives')
            console.log('🎮 Game lives before:', this.game.lives)
            console.log('⚙️ Full settings object:', this.settings)
            
            // Apply timer setting
            this.game.TURN_TIME_LIMIT = this.settings.timerSeconds * 1000
            
            // Apply lives setting
            this.game.lives = {
                X: this.settings.startingLives,
                O: this.settings.startingLives
            }
            
            console.log('🎮 Game lives after:', this.game.lives)
            
            // Note: updateLivesDisplay() will be called explicitly after this method
        } else {
            console.warn('⚠️ applySettingsToGame: No game instance')
        }
    }

    /**
     * Centralized function to update starting lives setting
     * Called from both start screen and settings menu
     */
    updateStartingLives(newLives) {
        console.log(`❤️ updateStartingLives() called with ${newLives} lives`)
        
        // Update the setting
        this.settings.startingLives = newLives
        
        // Update game lives if game is active and ready
        if (this.game && this.game.lives) {
            console.log('❤️ Game is active and ready, updating game lives')
            
            // Don't restore lost lives - only update the display to show the new total
            // The current game state should be preserved
            console.log('❤️ Preserving current game state, only updating display')
            
            // Update the visual display
            this.updateLivesDisplay()
        } else {
            console.log('❤️ Game not active or not ready, lives will be applied when game starts')
        }
        
        // Sync both UI elements to keep them in sync
        this.syncStartingLivesUI(newLives)
    }

    /**
     * Sync starting lives UI elements to match current setting
     */
    syncStartingLivesUI(lives) {
        // Update start screen lives select
        const startStartingLives = document.getElementById('startStartingLives')
        if (startStartingLives) {
            startStartingLives.value = lives
        }
        
        // Update settings modal lives select
        if (this.elements.startingLivesSelect) {
            this.elements.startingLivesSelect.value = lives
        }
        
        console.log(`❤️ Starting lives UI synced to ${lives}`)
    }
    
    /**
     * Warn user about lives change during active game
     */
    warnAboutLivesChange(newLives) {
        const currentLives = this.settings.startingLives
        
        // Pause the game when confirmation modal opens
        if (this.game && this.game.isGameActive) {
            this.game.pauseGame()
        }
        
        // Create custom confirmation modal
        const confirmationModal = document.createElement('div')
        confirmationModal.className = 'modal confirmation-modal active'
        confirmationModal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content confirmation-content">
                <div class="confirmation-header">
                    <h3>❤️ Change Lives Setting?</h3>
                    <p>Changing lives from ${currentLives} to ${newLives} will reset the current game.</p>
                </div>
                
                <div class="confirmation-info">
                    <div class="info-item">🔄 Reset current game board</div>
                    <div class="info-item">📊 Keep session stats (games played, wins, ties)</div>
                    <div class="info-item">❤️ Apply new lives setting</div>
                </div>
                
                <div class="confirmation-buttons">
                    <button class="control-btn cancel-btn" id="cancelLivesChangeBtn" type="button">
                        ❌ CANCEL
                    </button>
                    <button class="control-btn confirm-btn" id="confirmLivesChangeBtn" type="button">
                        ✅ CONFIRM
                    </button>
                </div>
            </div>
        `
        
        // Add to body
        document.body.appendChild(confirmationModal)
        
        // Bind event listeners
        const cancelBtn = confirmationModal.querySelector('#cancelLivesChangeBtn')
        const confirmBtn = confirmationModal.querySelector('#confirmLivesChangeBtn')
        
        // Handle backdrop click
        const backdrop = confirmationModal.querySelector('.modal-backdrop')
        backdrop.addEventListener('click', () => {
            this.closeLivesChangeModal(confirmationModal, currentLives)
        })
        
        cancelBtn.addEventListener('click', () => {
            this.closeLivesChangeModal(confirmationModal, currentLives)
        })
        
        confirmBtn.addEventListener('click', () => {
            this.closeLivesChangeModal(confirmationModal, currentLives)
            this.restartGameWithNewLives(newLives)
        })
        
        // Focus on cancel button for safety
        cancelBtn.focus()
        
        console.log('❤️ Lives change confirmation modal displayed - Game paused')
    }
    
    /**
     * Close lives change confirmation modal
     */
    closeLivesChangeModal(modal, originalLives) {
        // Resume the game when modal closes
        if (this.game && this.game.isGameActive && this.game.isPaused) {
            this.game.resumeGame()
            console.log('▶️ Game resumed after lives change modal')
        }
        
        // Revert the select value to original
        if (this.elements.startingLivesSelect) {
            this.elements.startingLivesSelect.value = originalLives
        }
        
        // Remove modal from DOM
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal)
        }
        
        console.log('❤️ Lives change confirmation modal closed')
    }
    
    /**
     * Handle question modal backdrop click - treat as outside click
     */
    handleQuestionBackdropClick() {
        if (!this.game || !this.game.questionUI) {
            console.log('⚠️ Question backdrop clicked but no game or questionUI')
            return
        }
        
        console.log('💔 Player clicked outside question modal - treating as incorrect answer')
        
        // Call handleAnswerClick with empty string and outSideClick = true
        this.game.questionUI.handleAnswerClick('', true)
    }
    

    
    /**
     * Reset game with new lives setting (keeps session stats)
     */
    restartGameWithNewLives(newLives) {
        console.log(`🔄 Resetting game with new lives: ${newLives}`)
        console.log('📊 Stats before lives change reset:', this.stats)
        
        // Update the setting
        this.settings.startingLives = newLives
        
        // Sync start screen
        this.syncStartingLivesUI(newLives)
        
        // Reset the current game (preserving session stats)
        if (this.game) {
            // Reset only current game stats, keep session stats
            this.resetCurrentGameStats()
            console.log('📊 Stats after resetCurrentGameStats:', this.stats)
            
            // Reset the game state and apply new settings
            this.game.resetGame()
            this.applySettingsToGame()
            this.updateLivesDisplay()
            this.game.rebindHearts()
            this.game.startNewGame()
            
            console.log('📊 Stats after game restart:', this.stats)
        }
        
        // Close settings modal
        this.hideSettings()
        
        // Show notification
        this.showNotification(`Game reset with ${newLives} lives!`, 'info')
    }

        /**
     * Update lives display to match current settings
     */
    updateLivesDisplay() {
        try {
            console.log('❤️ updateLivesDisplay() called')
            
            if (!this.game) {
                console.log('⚠️ updateLivesDisplay: No game instance - creating hearts anyway for initialization')
                // Continue without game instance for initial setup
            }
            
            // Safety check for settings
            if (!this.settings || typeof this.settings.startingLives === 'undefined') {
                console.error('❌ updateLivesDisplay: settings or startingLives is undefined')
                console.log('❌ this.settings:', this.settings)
                return
            }
            
            const startingLives = this.settings.startingLives
            console.log('❤️ Updating lives display to:', startingLives, 'lives')
            console.log('❤️ Current settings:', this.settings)
            
            // Safety check for startingLives value
            if (typeof startingLives !== 'number' || startingLives < 1 || startingLives > 10) {
                console.error('❌ updateLivesDisplay: Invalid startingLives value:', startingLives)
                return
            }
            
            // Safety check for DOM elements
            const playerXArea = document.getElementById('playerXArea')
            const playerOArea = document.getElementById('playerOArea')
            
            if (!playerXArea || !playerOArea) {
                console.error('❌ updateLivesDisplay: Player areas not found')
                console.log('❌ playerXArea:', playerXArea)
                console.log('❌ playerOArea:', playerOArea)
                return
            }
            
            // Update both player areas
            ['X', 'O'].forEach(player => {
                try {
                    const playerArea = document.getElementById(`player${player}Area`)
                    if (!playerArea) {
                        console.warn(`⚠️ Player ${player} area not found`)
                        return
                    }
                    
                    const livesContainer = playerArea.querySelector('.lives-container')
                    if (!livesContainer) {
                        console.warn(`⚠️ Lives container for player ${player} not found`)
                        return
                    }
                    
                    // Clear existing hearts
                    livesContainer.innerHTML = ''
                    
                    // Create new hearts based on settings
                    for (let i = 1; i <= startingLives; i++) {
                        const heart = document.createElement('div')
                        heart.className = 'heart'
                        heart.setAttribute('data-life', i)
                        heart.setAttribute('data-player', player)
                        
                        // Check if this life is lost based on current game state
                        let heartSymbol = '❤️' // Default to alive
                        
                        if (this.game && this.game.lives && this.game.lives[player]) {
                            const currentLives = this.game.lives[player]
                            
                            // Calculate which hearts should be lost
                            // Hearts are created from left to right (i starts at 1)
                            // If we're reducing lives (e.g., 5 to 3), the leftmost hearts should be lost
                            const heartsToLose = startingLives - currentLives
                            
                            // If this heart index is within the "lost" range, mark it as lost
                            if (i <= heartsToLose) {
                                heartSymbol = '💔'
                            }
                        }
                        
                        heart.textContent = heartSymbol
                        heart.style.transition = 'all 0.3s ease'
                        
                        // Let CSS handle the styling
                        
                        livesContainer.appendChild(heart)
                    }
                } catch (playerError) {
                    console.error(`❌ Error processing player ${player}:`, playerError)
                }
            })
            
            // After recreating hearts, update their visual state to match current game state
            if (this.game && this.game.updateLives) {
                console.log('❤️ Calling game.updateLives() to restore visual state')
                this.game.updateLives()
            }
            
            // Note: Game lives are already set by applySettingsToGame()
            // We only need to update the visual display
            if (this.game && this.game.lives) {
                console.log('❤️ Lives display updated, game lives should be:', {
                    X: this.game.lives.X,
                    O: this.game.lives.O
                })
            } else {
                console.log('⚠️ Game or lives not fully initialized yet, skipping lives logging')
            }
        } catch (error) {
            console.error('❌ Error in updateLivesDisplay:', error)
        }
    }

    /**
     * Play again (keep stats, start fresh round)
     */
    async playAgain() {
        try {
            console.log('🔄 playAgain() called')
            console.log('🎮 Game instance exists:', this.game ? 'YES' : 'NO')
            console.log('🎭 Game over modal active:', this.elements.gameOverModal?.classList.contains('active'))
            
            // Hide the game over modal first
            this.hideGameOverModal()
            
            // Reset only current game stats, keep persistent stats
            this.resetCurrentGameStats()
            
            // Create new game instance if needed
            if (!this.game) {
                console.log('🎮 Creating new game instance for play again')
                this.game = new Game()
                await this.game.initUI()
                this.setupGameCallbacks()
            }
            
            // Apply current settings to new game
            this.applySettingsToGame()
            
            // Update lives display to match settings
            this.updateLivesDisplay()
            
            // Re-bind UI elements after lives display update
            if (this.game.bindUIElements) {
                this.game.bindUIElements()
            }
            
            // Re-bind hearts specifically after they've been recreated
            if (this.game.rebindHearts) {
                this.game.rebindHearts()
            }
            
            // Start fresh game with same settings and preserved stats
            await this.game.startNewGame()
            this.playSound('new-game')
            
            // Force initial player highlighting after game starts
            this.handlePlayerChange(this.game.currentPlayer)
            
            // Update stats display
            this.updateStatsDisplay()
            
            console.log('🔄 Play again - stats preserved!')
        } catch (error) {
            console.error('Error in playAgain:', error)
            this.showErrorMessage('Failed to start new game. Please try again.')
        }
    }

    /**
     * Handle game end with better modal updates
     */
    handleGameEnd(message) {
        // Only update statistics if it's a completed game (not manually ended)
        if (!message.includes('manually')) {
            this.updateStats(message)
        }
        
        // Play end game sound
        if (message.includes('wins')) {
            this.playSound('victory')
        } else if (message.includes('tie')) {
            this.playSound('tie')
        }
        
        // Show game over modal with delay for final animations
        setTimeout(() => {
            this.showGameOverModal(message)
            this.updateGameOverStats()
        }, 2000)
    }

    /**
     * ENHANCED: Update game statistics with immediate save and display
     */
    updateStats(message) {
        this.stats.gamesPlayed++
        
        if (message.includes('X wins')) {
            this.stats.playerXWins++
        } else if (message.includes('O wins')) {
            this.stats.playerOWins++
        } else if (message.includes('tie')) {
            this.stats.ties++
        }
        
        // Save and update immediately
        this.saveStats()
        this.updateStatsDisplay()
        
        console.log('📊 Stats updated:', this.stats)
    }

    /**
     * FIXED Issue B: Update player-specific question stats (current game only)
     */
    updatePlayerQuestionStats(player, isCorrect) {
        if (isCorrect) {
            this.stats.currentGameStats[player].questionsCorrect++
        } else {
            this.stats.currentGameStats[player].questionsWrong++
        }
        
        // Update display immediately
        this.updatePlayerStatsDisplay(player)
        // NOTE: Don't save these stats - they're per-game only
        
        console.log(`📊 Player ${player} current game question stats:`, this.stats.currentGameStats[player])
    }

    /**
     * FIXED Issue B: Method to update individual player stats display
     */
    updatePlayerStatsDisplay(player) {
        const correctEl = player === 'X' ? this.elements.playerXCorrect : this.elements.playerOCorrect
        const wrongEl = player === 'X' ? this.elements.playerXWrong : this.elements.playerOWrong
        
        if (correctEl) {
            const oldValue = parseInt(correctEl.textContent) || 0
            const newValue = this.stats.currentGameStats[player].questionsCorrect
            
            correctEl.textContent = newValue
            
            // Add glow effect for updates if value changed
            if (oldValue !== newValue) {
                correctEl.parentElement.style.transform = 'scale(1.1)'
                correctEl.parentElement.style.background = 'rgba(76, 175, 80, 0.4)'
                setTimeout(() => {
                    correctEl.parentElement.style.transform = 'scale(1)'
                    correctEl.parentElement.style.background = ''
                }, 300)
            }
        }
        
        if (wrongEl) {
            wrongEl.textContent = this.stats.currentGameStats[player].questionsWrong
        }
    }

    /**
     * ENHANCED: Update statistics display with animations
     */
    updateStatsDisplay() {
        // Global stats (header)
        if (this.elements.gamesPlayed) {
            const oldValue = parseInt(this.elements.gamesPlayed.textContent) || 0
            const newValue = this.stats.gamesPlayed
            if (oldValue !== newValue) {
                this.elements.gamesPlayed.style.transform = 'scale(1.2)'
                this.elements.gamesPlayed.style.color = 'var(--success-color)'
                setTimeout(() => {
                    this.elements.gamesPlayed.textContent = newValue
                    this.elements.gamesPlayed.style.transform = 'scale(1)'
                    this.elements.gamesPlayed.style.color = ''
                }, 200)
            } else {
                this.elements.gamesPlayed.textContent = newValue
            }
        }
        
        if (this.elements.ties) {
            this.elements.ties.textContent = this.stats.ties
        }
        
        // Player wins with animation
        if (this.elements.playerXWins) {
            this.elements.playerXWins.textContent = this.stats.playerXWins
        }
        if (this.elements.playerOWins) {
            this.elements.playerOWins.textContent = this.stats.playerOWins
        }
        
        // Player question stats (current game only)
        this.updatePlayerStatsDisplay('X')
        this.updatePlayerStatsDisplay('O')
        
        console.log('📊 All stats display updated:', this.stats)
    }

    /**
     * Clear ALL statistics for fresh start
     */
    clearAllStatistics() {
        console.log('🗑️ clearAllStatistics() called')
        console.log('📊 Stats before clearing:', this.stats)
        
        this.stats = {
            gamesPlayed: 0,
            playerXWins: 0,
            playerOWins: 0,
            ties: 0,
            currentGameStats: {
                X: { questionsCorrect: 0, questionsWrong: 0 },
                O: { questionsCorrect: 0, questionsWrong: 0 }
            }
        }
        
        this.saveStats()
        this.updateStatsDisplay()
        this.showNotification('All statistics cleared for fresh start!', 'success', 2000)
        console.log('📊 ALL statistics cleared for fresh start')
        console.log('📊 Stats after clearing:', this.stats)
    }

    /**
     * Update game over modal with accurate stats
     */
    updateGameOverStats() {
        const gameOverStats = document.getElementById('gameOverStats')
        if (gameOverStats && this.game) {
            // Show the stats section
            gameOverStats.style.display = 'block'
            
            // Get accurate game data
            const questionsUsed = this.game.questionBank?.getUsedCount() || 0
            const cacheSize = this.game.cellQuestionCache?.size || 0
            const totalQuestionsAnswered = questionsUsed + cacheSize
            
            // Update individual stats if elements exist
            const questionsAnswered = document.getElementById('questionsAnswered')
            const correctAnswers = document.getElementById('correctAnswers') 
            const gameDuration = document.getElementById('gameDuration')
            
            if (questionsAnswered) {
                questionsAnswered.textContent = totalQuestionsAnswered
            }
            
            if (correctAnswers) {
                correctAnswers.textContent = questionsUsed
            }
            
            if (gameDuration) {
                const baseTime = 30
                const timePerQuestion = 8
                const estimatedDuration = baseTime + (totalQuestionsAnswered * timePerQuestion)
                const minutes = Math.floor(estimatedDuration / 60)
                const seconds = estimatedDuration % 60
                gameDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`
            }
        }
    }

    /**
     * Show game over modal
     */
    showGameOverModal(message) {
        if (this.elements.gameOverModal && this.elements.gameOverMessage) {
            this.elements.gameOverMessage.textContent = message
            this.elements.gameOverModal.classList.add('active')
            console.log('🎭 Game over modal shown with message:', message)
            console.log('🎮 Current game instance:', this.game ? 'exists' : 'null')
        } else {
            console.warn('⚠️ Game over modal elements not found')
        }
    }

    /**
     * Hide game over modal
     */
    hideGameOverModal() {
        if (this.elements.gameOverModal) {
            this.elements.gameOverModal.classList.remove('active')
            console.log('🎭 Game over modal hidden')
        } else {
            console.warn('⚠️ Game over modal element not found')
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        if (this.elements.settingsModal) {
            console.log('Opening settings...')
            
            // Pause the game when settings modal opens
            if (this.game && this.game.isGameActive && !this.game.isPaused) {
                this.game.pauseGame()
                console.log('⏸️ Game paused for settings modal')
            }
            
            this.elements.settingsModal.classList.add('active')
            this.syncSettingsToUI()
        }
    }

    /**
     * Hide settings modal
     */
    hideSettings() {
        if (this.elements.settingsModal) {
            this.elements.settingsModal.classList.remove('active')
            
            // Resume the game when settings modal closes
            if (this.game && this.game.isGameActive && this.game.isPaused) {
                this.game.resumeGame()
                console.log('▶️ Game resumed after settings modal')
            }
        }
    }

    /**
     * Save settings with user feedback
     */
    saveSettingsWithFeedback() {
        this.saveSettings()
        this.applyAllSettings()
        this.showNotification('Settings saved successfully!', 'success', 2000)
        console.log('⚙️ Settings saved and applied')
        
        // Automatically close the settings modal
        this.hideSettings()
    }

    /**
     * Sync settings to UI elements
     */
    syncSettingsToUI() {
        if (this.elements.soundToggle) {
            this.elements.soundToggle.checked = this.settings.soundEnabled
        }
        
        if (this.elements.timerDurationSelect) {
            this.elements.timerDurationSelect.value = this.settings.timerSeconds
        }
        
        if (this.elements.startingLivesSelect) {
            this.elements.startingLivesSelect.value = this.settings.startingLives
        }
        
        if (this.elements.difficultySelect) {
            this.elements.difficultySelect.value = this.settings.difficulty
        }
        
        if (this.elements.animationsToggle) {
            this.elements.animationsToggle.checked = this.settings.animationsEnabled
        }
        
        if (this.elements.musicToggle) {
            this.elements.musicToggle.checked = this.settings.musicEnabled
        }
        
        this.updateSoundButton()
    }

    /**
     * Apply all settings
     */
    applyAllSettings() {
        this.applySound()
        this.applyMusic()
        this.applyAnimations()
        this.applySettingsToGame()
        this.updateSoundButton()
        // Also sync start screen settings
        this.syncStartScreenSettings()
    }

    /**
     * Apply sound settings
     */
    applySound() {
        if (this.audioSystem) {
            this.audioSystem.setEnabled(this.settings.soundEnabled)
        }
        this.updateSoundButton()
    }

    /**
     * Apply music settings
     */
    applyMusic() {
        if (this.audioSystem) {
            this.audioSystem.setMusicEnabled(this.settings.musicEnabled)
        }
        console.log(`🎵 Music ${this.settings.musicEnabled ? 'enabled' : 'disabled'}`)
    }

    /**
     * Apply animation settings
     */
    applyAnimations() {
        if (this.settings.animationsEnabled) {
            document.body.classList.remove('no-animations')
        } else {
            document.body.classList.add('no-animations')
        }
    }

    /**
     * Toggle main sound button
     */
    toggleMainSoundButton() {
        this.settings.soundEnabled = !this.settings.soundEnabled
        this.applySound()
        this.saveSettings()
        
        // Also update settings toggle if it exists
        if (this.elements.soundToggle) {
            this.elements.soundToggle.checked = this.settings.soundEnabled
        }
        
        console.log(`🔊 Sound ${this.settings.soundEnabled ? 'enabled' : 'disabled'}`)
    }

    /**
     * Update sound button appearance
     */
    updateSoundButton() {
        if (this.elements.soundBtn) {
            this.elements.soundBtn.textContent = this.settings.soundEnabled ? '🔊' : '🔇'
            this.elements.soundBtn.classList.toggle('active', this.settings.soundEnabled)
            this.elements.soundBtn.classList.toggle('muted', !this.settings.soundEnabled)
        }
    }

    /**
     * FIXED Issue A: Enhanced player change with prominent visual updates
     */
    handlePlayerChange(newPlayer) {
        this.playSound('turn-change')
        
        // FIXED Issue A: Enhanced active player visual states with stronger highlighting
        if (this.elements.playerXArea && this.elements.playerOArea) {
            // Remove active class from both first
            this.elements.playerXArea.classList.remove('active')
            this.elements.playerOArea.classList.remove('active')
            
            // Add active class to current player with enhanced effect
            if (newPlayer === 'X') {
                this.elements.playerXArea.classList.add('active')
                // Additional prominence for Player X
                this.elements.playerXArea.style.boxShadow = '0 0 25px rgba(102, 126, 234, 0.6)'
                this.elements.playerOArea.style.boxShadow = ''
            } else {
                this.elements.playerOArea.classList.add('active')
                // Additional prominence for Player O
                this.elements.playerOArea.style.boxShadow = '0 0 25px rgba(240, 147, 251, 0.6)'
                this.elements.playerXArea.style.boxShadow = ''
            }
        }
        
        console.log(`🔄 Player changed to: ${newPlayer}`)
    }

    /**
     * Handle lives change
     */
    handleLivesChange(player, lives) {
        if (lives <= 0) {
            this.playSound('game-over')
        } else {
            this.playSound('life-lost')
        }
    }

    /**
     * Play sound effect
     */
    playSound(soundName) {
        if (this.audioSystem && this.settings.soundEnabled) {
            this.audioSystem.play(soundName)
        }
    }

    /**
     * Handle global keyboard events
     */
    handleGlobalKeyboard(e) {
        // Don't interfere when typing in inputs or if modals are open
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
            return
        }

        switch(e.key) {
            case 'Escape':
                // Close any open modal
                if (this.elements.settingsModal?.classList.contains('active')) {
                    this.hideSettings()
                } else if (this.elements.gameOverModal?.classList.contains('active')) {
                    this.hideGameOverModal()
                }
                break
                
            case 'n':
            case 'N':
                this.startNewGame()
                break
                
            case 'm':
            case 'M':
                this.toggleMainSoundButton()
                break
                
            case 'e':
            case 'E':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    this.endCurrentGame()
                }
                break
                
            case 's':
            case 'S':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault()
                    this.showSettings()
                }
                break
        }
    }

    /**
     * Handle modal backdrop clicks
     */
    handleModalBackdropClick(e) {
        // Close modal if clicking backdrop
        if (e.target.classList.contains('modal-backdrop')) {
            const modal = e.target.closest('.modal')
            if (modal) {
                modal.classList.remove('active')
            }
        }
    }

    /**
     * ENHANCED: Load settings from localStorage
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('tictactoe-blitz-settings')
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings)
                this.settings = { ...this.settings, ...parsed }
            }
            
            // Apply loaded settings
            this.applyAllSettings()
            this.syncSettingsToUI()
            
            console.log('⚙️ Settings loaded from localStorage:', this.settings)
            console.log('⚙️ This will be overridden by start screen settings when game starts')
        } catch (error) {
            console.error('Error loading settings:', error)
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            // Read current start screen settings before saving (these take priority)
            this.loadStartScreenSettingsIntoApp()
            
            localStorage.setItem('tictactoe-blitz-settings', JSON.stringify(this.settings))
            console.log('💾 Settings saved with start screen priority:', this.settings)
        } catch (error) {
            console.error('Error saving settings:', error)
        }
    }

    /**
     * FIXED Issue B: Load stats from localStorage - exclude current game stats
     */
    loadStats() {
        try {
            const savedStats = localStorage.getItem('tictactoe-blitz-stats')
            if (savedStats) {
                const parsed = JSON.parse(savedStats)
                // Validate stats object and load only persistent stats
                if (parsed && typeof parsed === 'object') {
                    this.stats.gamesPlayed = parseInt(parsed.gamesPlayed) || 0
                    this.stats.playerXWins = parseInt(parsed.playerXWins) || 0
                    this.stats.playerOWins = parseInt(parsed.playerOWins) || 0
                    this.stats.ties = parseInt(parsed.ties) || 0
                    
                    // FIXED Issue B: Don't load currentGameStats - always start fresh
                    this.stats.currentGameStats = {
                        X: { questionsCorrect: 0, questionsWrong: 0 },
                        O: { questionsCorrect: 0, questionsWrong: 0 }
                    }
                }
            }
            console.log('📊 Stats loaded:', this.stats)
        } catch (error) {
            console.error('Error loading stats:', error)
            // Reset to defaults on error
            this.stats = {
                gamesPlayed: 0,
                playerXWins: 0,
                playerOWins: 0,
                ties: 0,
                currentGameStats: {
                    X: { questionsCorrect: 0, questionsWrong: 0 },
                    O: { questionsCorrect: 0, questionsWrong: 0 }
                }
            }
        }
    }

    /**
     * FIXED Issue B: Save stats to localStorage - exclude current game stats
     */
    saveStats() {
        try {
            // Only save persistent stats, not current game stats
            const persistentStats = {
                gamesPlayed: this.stats.gamesPlayed,
                playerXWins: this.stats.playerXWins,
                playerOWins: this.stats.playerOWins,
                ties: this.stats.ties
                // currentGameStats are NOT saved - they reset each game
            }
            localStorage.setItem('tictactoe-blitz-stats', JSON.stringify(persistentStats))
            console.log('💾 Persistent stats saved:', persistentStats)
        } catch (error) {
            console.error('Error saving stats:', error)
        }
    }

    /**
     * Save progress on page unload
     */
    saveProgress() {
        this.saveSettings()
        this.saveStats()
    }

    /**
     * Bind start screen settings event listeners
     */
    bindStartScreenSettings() {
        // Timer duration
        const startTimerDuration = document.getElementById('startTimerDuration')
        if (startTimerDuration) {
            startTimerDuration.addEventListener('change', (e) => {
                this.settings.timerSeconds = parseInt(e.target.value)
                console.log(`⏰ Start screen timer set to ${this.settings.timerSeconds} seconds`)
            })
        }

        // Starting lives
        const startStartingLives = document.getElementById('startStartingLives')
        if (startStartingLives) {
            startStartingLives.addEventListener('change', (e) => {
                const newLives = parseInt(e.target.value)
                console.log(`❤️ Start screen starting lives changed to ${newLives}`)
                this.updateStartingLives(newLives)
            })
        }

        // Difficulty
        const startDifficulty = document.getElementById('startDifficulty')
        if (startDifficulty) {
            startDifficulty.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value
                console.log(`🧠 Start screen difficulty set to ${this.settings.difficulty}`)
            })
        }

        // Sound toggle
        const startSoundToggle = document.getElementById('startSoundToggle')
        if (startSoundToggle) {
            startSoundToggle.addEventListener('change', (e) => {
                this.settings.soundEnabled = e.target.checked
                this.applySound()
                console.log(`🔊 Start screen sound ${this.settings.soundEnabled ? 'enabled' : 'disabled'}`)
            })
        }
    }

    /**
     * Sync start screen settings with current settings
     */
    syncStartScreenSettings() {
        // Timer duration
        const startTimerDuration = document.getElementById('startTimerDuration')
        if (startTimerDuration) {
            startTimerDuration.value = this.settings.timerSeconds
        }

        // Starting lives
        this.syncStartingLivesUI(this.settings.startingLives)

        // Difficulty
        const startDifficulty = document.getElementById('startDifficulty')
        if (startDifficulty) {
            startDifficulty.value = this.settings.difficulty
        }

        // Sound toggle
        const startSoundToggle = document.getElementById('startSoundToggle')
        if (startSoundToggle) {
            startSoundToggle.checked = this.settings.soundEnabled
        }
        
        console.log('⚙️ Start screen settings synced:', {
            timer: this.settings.timerSeconds,
            lives: this.settings.startingLives,
            difficulty: this.settings.difficulty,
            sound: this.settings.soundEnabled
        })
    }

    /**
     * Load start screen settings from DOM into app settings
     */
    loadStartScreenSettingsIntoApp() {
        try {
            console.log('⚙️ Loading start screen settings from DOM...')
            
            // Timer duration
            const startTimerDuration = document.getElementById('startTimerDuration')
            if (startTimerDuration) {
                const timerValue = parseInt(startTimerDuration.value)
                console.log('⏰ Timer DOM value:', startTimerDuration.value, '-> parsed:', timerValue)
                this.settings.timerSeconds = timerValue
            }

            // Starting lives
            const startStartingLives = document.getElementById('startStartingLives')
            if (startStartingLives) {
                const livesValue = parseInt(startStartingLives.value)
                console.log('❤️ Lives DOM value:', startStartingLives.value, '-> parsed:', livesValue)
                this.settings.startingLives = livesValue
            }

            // Difficulty
            const startDifficulty = document.getElementById('startDifficulty')
            if (startDifficulty) {
                const difficultyValue = startDifficulty.value
                console.log('🧠 Difficulty DOM value:', difficultyValue)
                this.settings.difficulty = difficultyValue
            }

            // Sound toggle
            const startSoundToggle = document.getElementById('startSoundToggle')
            if (startSoundToggle) {
                const soundValue = startSoundToggle.checked
                console.log('🔊 Sound DOM value:', soundValue)
                this.settings.soundEnabled = soundValue
            }
            
            console.log('⚙️ Start screen settings loaded into app:', this.settings)
            console.log('❤️ Specifically, lives setting is now:', this.settings.startingLives)
        } catch (error) {
            console.error('Error loading start screen settings:', error)
        }
    }

    /**
     * Enhanced notification system
     */
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer')
        if (!container) return
        
        const notification = document.createElement('div')
        notification.className = `notification-toast ${type}`
        notification.textContent = message
        
        // Add icon based on type
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }
        
        if (icons[type]) {
            notification.textContent = `${icons[type]} ${message}`
        }
        
        container.appendChild(notification)
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100)
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show')
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove()
                }
            }, 300)
        }, duration)
    }

    /**
     * Show error message
     */
    showErrorMessage(message, details = null) {
        // Create temporary error display
        const errorDiv = document.createElement('div')
        errorDiv.className = 'error-message'
        errorDiv.innerHTML = `
            <div class="error-title">⚠️ ${message}</div>
            ${details ? `<div class="error-details">${details}</div>` : ''}
            <div class="error-actions">
                <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #ff4757, #ff3742);
            color: white;
            padding: 1rem 2rem;
            border-radius: 12px;
            z-index: 10000;
            animation: slideDown 0.3s ease;
            box-shadow: 0 10px 30px rgba(255, 71, 87, 0.3);
            max-width: 400px;
            text-align: center;
        `
        
        document.body.appendChild(errorDiv)
        
        // Auto remove after 10 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'fadeOut 0.3s ease'
                setTimeout(() => errorDiv.remove(), 300)
            }
        }, 10000)
    }

    /**
     * Get app status for debugging
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            gameActive: this.game?.isGameActive ?? false,
            currentPlayer: this.game?.currentPlayer ?? null,
            gameLives: this.game?.lives ?? null,
            questionBankStatus: {
                available: this.game?.questionBank?.getAvailableCount() ?? 0,
                used: this.game?.questionBank?.getUsedCount() ?? 0
            },
            stats: this.stats,
            settings: this.settings,
            audioEnabled: this.audioSystem?.isEnabled ?? false,
            musicEnabled: this.audioSystem?.musicEnabled ?? false,
            domConnections: this.validateDOMConnections()
        }
    }

    /**
     * UPDATED: DOM validation with new player stat elements
     */
    validateDOMConnections() {
        const required = [
            'playerXArea', 'playerOArea', 'timerText', 'timerCountdown', 
            'timerBar', 'questionModal', 'gameOverModal', 'startScreen',
            'endGameBtn', 'playerXWins', 'playerOWins', 'playerXCorrect', 
            'playerXWrong', 'playerOCorrect', 'playerOWrong'
        ]
        
        const missing = required.filter(id => !document.getElementById(id))
        return {
            allConnected: missing.length === 0,
            missing: missing,
            cellsFound: document.querySelectorAll('[data-row][data-col]').length,
            playerAreasFound: document.querySelectorAll('.player-area').length
        }
    }
}

// Initialize app when DOM is ready
const app = new TicTacToeBlitzApp()

// Start the app
app.init().catch(error => {
    console.error('Fatal error initializing app:', error)
})

// Export app instance for debugging
window.TicTacToeBlitzApp = app

// Add debugging function
window.gameStatus = () => {
    return app.getStatus()
}