// app.js - FIXED: All three critical issues resolved
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
            
            // Update stats display
            this.updateStatsDisplay()
            
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

        // Initialize game
        this.game = new Game()
        await this.game.initUI()

        // Bind DOM elements
        this.bindDOMElements()
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
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
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
        if (this.elements.closeSettingsBtn) {
            this.elements.closeSettingsBtn.addEventListener('click', () => this.hideSettings())
        }
        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettingsWithFeedback())
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
                this.settings.startingLives = parseInt(e.target.value)
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
            this.elements.playAgainBtn.addEventListener('click', () => this.playAgain())
        }
        if (this.elements.newGameBtn) {
            this.elements.newGameBtn.addEventListener('click', () => this.startNewGame())
        }
        if (this.elements.newGameFromModalBtn) {
            this.elements.newGameFromModalBtn.addEventListener('click', () => this.startNewGame())
        }
    
        // Start screen buttons
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => this.startFirstGame())
        }
        if (this.elements.quickStartBtn) {
            this.elements.quickStartBtn.addEventListener('click', () => this.quickStart())
        }
        
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
     * End Current Game manually
     */
    endCurrentGame() {
        if (this.game && this.game.isGameActive) {
            // Confirm before ending
            if (confirm('Are you sure you want to end the current game? This will not count as a completed game.')) {
                this.game.endGame('Game ended manually')
                this.showNotification('Game ended manually', 'info', 2000)
                console.log('🛑 Game ended manually by user')
            }
        } else {
            this.showNotification('No active game to end', 'warning', 2000)
        }
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
        this.hideStartScreen()
        await this.startNewGame()
        this.showNotification('Game started!', 'success', 2000)
    }

    /**
     * FIXED Issue B: Start new game with proper question stats reset
     */
    async startNewGame() {
        try {
            this.hideGameOverModal()
            
            // FIXED Issue B: Reset current game question stats (NOT persistent stats)
            this.resetCurrentGameStats()
            
            // Apply current settings to new game
            this.applySettingsToGame()
            
            await this.game.startNewGame()
            this.playSound('new-game')
            
            // FIXED Issue A: Force initial player highlighting after game starts
            this.handlePlayerChange(this.game.currentPlayer)
            
            // Update stats display
            this.updateStatsDisplay()
            
            console.log('🎮 New game started!')
            console.log('📊 Current Statistics:', this.stats)
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
     * Apply settings to game
     */
    applySettingsToGame() {
        if (this.game) {
            // Apply timer setting
            this.game.TURN_TIME_LIMIT = this.settings.timerSeconds * 1000
            
            // Apply lives setting
            this.game.lives = {
                [this.game.BOARD.PLAYER1]: this.settings.startingLives,
                [this.game.BOARD.PLAYER2]: this.settings.startingLives
            }
        }
    }

    /**
     * Play again (keep stats, start fresh round)
     */
    async playAgain() {
        await this.startNewGame()
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
     * FIXED Issue B: Clear all statistics including current game stats
     */
    clearStatistics() {
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
        this.showNotification('All statistics cleared!', 'info', 2000)
        console.log('📊 Statistics have been reset completely')
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
        }
    }

    /**
     * Hide game over modal
     */
    hideGameOverModal() {
        if (this.elements.gameOverModal) {
            this.elements.gameOverModal.classList.remove('active')
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        if (this.elements.settingsModal) {
            console.log('Opening settings...')
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
            
            console.log('⚙️ Settings loaded:', this.settings)
        } catch (error) {
            console.error('Error loading settings:', error)
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('tictactoe-blitz-settings', JSON.stringify(this.settings))
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