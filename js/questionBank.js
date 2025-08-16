// questionBank.js - Browser-ready QuestionBank class
class QuestionBank {
    constructor() {
        this.questions = []
        this.usedQuestions = new Set()
        this.maxQuestions = 25
        this.minQuestions = 5
        this.rawQuestionData = []
    }

    isFull() {
        return this.questions.length === this.maxQuestions
    }

    isQuestionsLoaded() {
        if (this.questions.length >= this.minQuestions && this.questions.length <= this.maxQuestions) {
            console.log(`Question bank is loaded with ${this.questions.length} questions and is ready to go!`)
            return true
        }
        throw new Error(`Question bank is not loaded with enough questions. It should be between ${this.minQuestions} and ${this.maxQuestions} questions.`)
    }

    addQuestion(questionId) {
        if (this.isFull()) {
            throw new Error(`Cannot add more than ${this.maxQuestions} questions`)
        }
        this.questions.push(questionId)
    }

    getRandomQuestion() {
        if (this.questions.length === 0) {
            console.log("No questions available in the bank.")
            return null
        }
        const randomIndex = Math.floor(Math.random() * this.questions.length)
        const questionId = this.questions[randomIndex]
        console.log(`Selected question ID ${questionId} from ${this.questions.length} available questions`)
        return questionId
    }

    /**
     * ENHANCED: Mark question as used with better tracking
     */
    markQuestionAsUsed(questionId) {
        if (questionId === null || questionId === undefined) {
            console.warn('Attempted to mark null/undefined question as used')
            return false
        }

        if (!this.usedQuestions.has(questionId)) {
            this.usedQuestions.add(questionId)
            this.questions = this.questions.filter(qId => qId !== questionId)
            console.log(`âœ… Question ID ${questionId} marked as used. Remaining: ${this.questions.length}`)
            return true
        } else {
            console.warn(`âš ï¸ Question ID ${questionId} was already marked as used!`)
            // Remove it from available questions anyway (safety check)
            this.questions = this.questions.filter(qId => qId !== questionId)
            return false
        }
    }

    reset() {
        this.questions = []
        this.usedQuestions.clear()
        console.log("Question bank has been reset.")
    }

    /**
     * Load questions from raw data array
     * @param {Array} questionsData - Array of question objects
     */
    loadQuestions(questionsData) {
        try {
            // Store raw data
            this.rawQuestionData = questionsData

            // Clear existing questions
            this.questions = []
            this.usedQuestions.clear()

            // Add question IDs to available pool
            questionsData.forEach(questionData => {
                this.addQuestion(questionData.id)
            })

            console.log(`Loaded ${this.questions.length} questions into question bank`)
            return true
        } catch (error) {
            console.error('Error loading questions:', error.message)
            return false
        }
    }

    /**
     * Get Question object by ID (lazy loading)
     * @param {number} questionId - The question ID
     * @returns {Question|null} Question object or null if not found
     */
    getQuestionById(questionId) {
        const questionData = this.rawQuestionData.find(q => q.id === questionId)
        if (!questionData) {
            console.error(`Question with ID ${questionId} not found`)
            return null
        }

        try {
            return new Question(
                questionData.question,
                questionData.answers,
                questionData.category,
                questionData.difficulty,
                questionData.correctAnswer
            )
        } catch (error) {
            console.error(`Error creating Question object for ID ${questionId}:`, error.message)
            return null
        }
    }

    /**
     * Get available questions count
     * @returns {number} Number of available questions
     */
    getAvailableCount() {
        return this.questions.length
    }

    /**
     * Get used questions count
     * @returns {number} Number of used questions
     */
    getUsedCount() {
        return this.usedQuestions.size
    }

    /**
     * NEW: Debug method to check question status
     */
    getQuestionStatus() {
        return {
            available: [...this.questions],
            used: [...this.usedQuestions],
            availableCount: this.questions.length,
            usedCount: this.usedQuestions.size,
            totalLoaded: this.rawQuestionData.length
        }
    }
}

// questionUI.js - Browser UI for questions with enhanced feedback
class QuestionUI {
    constructor() {
        this.questionModal = null
        this.currentQuestion = null
        this.currentResolve = null
        this.isVisible = false
        this.answerButtons = []
        this.soundCallbacks = {
            onCorrect: null,
            onIncorrect: null
        }
        this.bindElements()
    }

    /**
     * Set sound callbacks for immediate feedback
     */
    setSoundCallbacks(onCorrect, onIncorrect) {
        this.soundCallbacks.onCorrect = onCorrect
        this.soundCallbacks.onIncorrect = onIncorrect
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.questionModal = document.getElementById('questionModal')
        this.questionText = document.getElementById('questionText')
        this.answerOptions = document.getElementById('answerOptions')
        this.questionPlayerName = document.getElementById('questionPlayerName')
        
        // Create answer buttons if they don't exist
        this.createAnswerButtons()
        
        // Bind escape key (but don't allow closing during questions)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                console.log('Cannot escape during question - must answer!')
            }
        })
    }

    /**
     * Create answer buttons dynamically
     */
    createAnswerButtons() {
        if (!this.answerOptions) return
        
        this.answerOptions.innerHTML = '' // Clear existing buttons
        this.answerButtons = []
        
        const letters = ['A', 'B', 'C', 'D']
        letters.forEach((letter, index) => {
            const button = document.createElement('button')
            button.className = 'answer-btn'
            button.setAttribute('data-answer', letter)
            button.textContent = `${letter}: `
            button.addEventListener('click', () => this.handleAnswerClick(letter))
            
            this.answerOptions.appendChild(button)
            this.answerButtons.push(button)
        })
    }

    /**
     * Show question modal
     * @param {Question} questionObj - Question object to display
     * @param {string} currentPlayer - Current player ('X' or 'O')
     * @returns {Promise<string>} Promise that resolves with the selected answer
     */
    showQuestion(questionObj, currentPlayer) {
        return new Promise((resolve) => {
            this.currentQuestion = questionObj
            this.currentResolve = resolve
            this.isVisible = true

            // Update modal content
            if (this.questionPlayerName) {
                this.questionPlayerName.textContent = `Player ${currentPlayer}`
            }
            
            if (this.questionText) {
                this.questionText.textContent = questionObj.question
            }

            // Update answer buttons
            const answers = questionObj.getAnswers()
            this.answerButtons.forEach((button, index) => {
                const letter = ['A', 'B', 'C', 'D'][index]
                button.textContent = `${letter}: ${answers[letter]}`
                button.classList.remove('correct', 'incorrect', 'disabled')
                button.disabled = false
            })

            // Show modal with animation
            if (this.questionModal) {
                this.questionModal.classList.add('active')
                this.questionModal.setAttribute('aria-hidden', 'false')
            }
            
            // Focus first answer button for accessibility
            if (this.answerButtons.length > 0) {
                setTimeout(() => this.answerButtons[0].focus(), 100)
            }
        })
    }

    /**
     * ENHANCED Handle answer button click with immediate sound feedback
     * @param {string} selectedAnswer - The selected answer letter
     */
    handleAnswerClick(selectedAnswer) {
        if (!this.currentQuestion || !this.currentResolve) return

        // Disable all buttons immediately to prevent double-clicking
        this.answerButtons.forEach(button => {
            button.disabled = true
            button.classList.add('disabled')
        })

        // Check if answer is correct
        const isCorrect = this.currentQuestion.isCorrect(selectedAnswer)
        
        // ENHANCED: Immediate sound feedback
        if (isCorrect && this.soundCallbacks.onCorrect) {
            this.soundCallbacks.onCorrect()
        } else if (!isCorrect && this.soundCallbacks.onIncorrect) {
            this.soundCallbacks.onIncorrect()
        }
        
        // FIXED: Visual feedback - don't show correct answer for wrong guesses
        this.answerButtons.forEach(button => {
            const buttonAnswer = button.getAttribute('data-answer')
            if (buttonAnswer === selectedAnswer) {
                // Show the selected answer state
                if (isCorrect) {
                    button.classList.add('correct')
                } else {
                    button.classList.add('incorrect')
                }
            }
            // CRITICAL FIX: Don't highlight the correct answer when wrong is selected
            // This preserves the mystery for other players
        })

        // Show feedback message
        this.showFeedback(isCorrect)

        // Resolve after a shorter delay since sound already played
        setTimeout(() => {
            this.hideQuestion()
            if (this.currentResolve) {
                this.currentResolve(selectedAnswer)
                this.currentResolve = null
            }
        }, 1500) // Reduced from 2000ms since sound gives immediate feedback
    }

    /**
     * Show feedback message
     * @param {boolean} isCorrect - Whether the answer was correct
     */
    showFeedback(isCorrect) {
        // Remove any existing feedback first
        const existingFeedback = this.questionModal.querySelector('.feedback-message')
        if (existingFeedback) {
            existingFeedback.remove()
        }
        
        const feedbackEl = document.createElement('div')
        feedbackEl.className = `feedback-message ${isCorrect ? 'correct' : 'incorrect'}`
        
        // ENHANCED: Better feedback messages
        if (isCorrect) {
            feedbackEl.textContent = 'âœ… Correct! You claimed this cell!'
        } else {
            feedbackEl.textContent = 'âŒ Wrong answer! Question remains in this cell for others to try.'
        }
        
        // Add to modal content
        const modalContent = this.questionModal.querySelector('.modal-content')
        if (modalContent) {
            modalContent.appendChild(feedbackEl)
            
            // Animate in
            setTimeout(() => feedbackEl.classList.add('show'), 100)
        }
    }

    /**
     * Hide question modal
     */
    hideQuestion() {
        this.isVisible = false
        this.currentQuestion = null
        
        if (this.questionModal) {
            this.questionModal.classList.remove('active')
            this.questionModal.setAttribute('aria-hidden', 'true')
        }
        
        // Remove feedback message if exists
        const feedback = this.questionModal?.querySelector('.feedback-message')
        if (feedback) {
            feedback.remove()
        }
        
        // Re-enable buttons for next question
        this.answerButtons.forEach(button => {
            button.disabled = false
            button.classList.remove('disabled', 'correct', 'incorrect')
        })
    }

    /**
     * Check if question modal is currently visible
     * @returns {boolean} True if visible
     */
    isQuestionVisible() {
        return this.isVisible
    }

    /**
     * Force close question (emergency use only)
     */
    forceClose() {
        console.warn('Force closing question modal')
        this.hideQuestion()
        if (this.currentResolve) {
            this.currentResolve(null) // Return null to indicate forced close
            this.currentResolve = null
        }
    }

    /**
     * Get current question status for debugging
     */
    getStatus() {
        return {
            isVisible: this.isVisible,
            hasCurrentQuestion: !!this.currentQuestion,
            hasResolve: !!this.currentResolve,
            modalElement: !!this.questionModal,
            answerButtonsCount: this.answerButtons.length,
            currentQuestionId: this.currentQuestion ? 
                (this.currentQuestion.id || 'no-id') : 'none'
        }
    }
}

// Expose classes for use in other modules
window.QuestionBank = QuestionBank
window.QuestionUI = QuestionUI