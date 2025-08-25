class Question {
    constructor(Question, Answers, Category, Difficulty, CorrectAnswer) {
        this.validCorrectAnswers = ['A', 'B', 'C', 'D']
        this.validDifficulties = ['easy', 'medium', 'hard']
        
        // Validate difficulty (case-insensitive)
        if (!this.validDifficulties.includes(Difficulty.toLowerCase())) {
            throw new Error(`${Difficulty} is not a valid difficulty. It should be 'easy', 'medium', or 'hard'`)
        }
        
        // Validate question
        if (typeof Question !== 'string' || Question.trim() === '') {
            throw new Error('Question must be a non-empty string')
        }
        
        // Validate answers array
        if (!Array.isArray(Answers) || Answers.length !== 4) {
            throw new Error('Answers must be an array of 4 strings')
        }
        
        // Validate each answer
        Answers.forEach((answer, index) => {
            if (typeof answer !== 'string' || answer.trim() === '') {
                throw new Error(`Answer ${index + 1} must be a non-empty string. Format should be ['answer1', 'answer2', 'answer3', 'answer4']`)
            }
        })
        
        // Validate correct answer
        if (typeof CorrectAnswer !== 'string' || !this.validCorrectAnswers.includes(CorrectAnswer.toUpperCase())) {
            throw new Error(`${CorrectAnswer} is not a valid answer. It should be 'A', 'B', 'C', or 'D'`)
        }
        
        // Validate category
        if (typeof Category !== 'string' || Category.trim() === '') {
            throw new Error('Category must be a non-empty string')
        }
    
        // Set properties
        this.question = Question.trim()
        this.answers = Answers.map(answer => answer.trim()) // Trim whitespace from answers
        this.category = Category.trim().toLowerCase()
        this.difficulty = Difficulty.trim().toLowerCase()
        this.correctAnswer = CorrectAnswer.toUpperCase()
    }
    
    /**
     * Check if the provided answer is correct
     * @param {string} answer - The answer to check (A, B, C, or D)
     * @returns {boolean} True if correct, false otherwise
     */
    isCorrect(answer) {
        if (typeof answer !== 'string') {
            console.warn('Answer must be a string')
            return false
        }
        return this.correctAnswer === answer.toUpperCase().trim()
    }
    
    /**
     * Get formatted answers object
     * @returns {Object} Answers mapped to letters {A: 'answer1', B: 'answer2', etc.}
     */
    getAnswers() {
        const formattedAnswers = {}
        this.answers.forEach((answer, index) => {
            formattedAnswers[this.validCorrectAnswers[index]] = answer
        })
        return formattedAnswers
    }
    
    /**
     * Get the correct answer text (not just the letter)
     * @returns {string} The text of the correct answer
     */
    getCorrectAnswerText() {
        const answers = this.getAnswers()
        return answers[this.correctAnswer] || 'Unknown'
    }
    
    /**
     * Get question data as a plain object
     * @returns {Object} Complete question data
     */
    toObject() {
        return {
            question: this.question,
            answers: [...this.answers], // Create a copy
            category: this.category,
            difficulty: this.difficulty,
            correctAnswer: this.correctAnswer,
            correctAnswerText: this.getCorrectAnswerText()
        }
    }
    
    /**
     * Get a formatted string representation of the question
     * @returns {string} Formatted question string
     */
    toString() {
        const answers = this.getAnswers()
        let result = `Question: ${this.question}\n`
        result += `Category: ${this.category} | Difficulty: ${this.difficulty}\n`
        result += 'Answers:\n'
        Object.entries(answers).forEach(([letter, text]) => {
            const marker = letter === this.correctAnswer ? 'âœ“' : ' '
            result += `  ${letter}: ${text} ${marker}\n`
        })
        return result
    }
    
    /**
     * Validate that this question is properly formatted
     * @returns {boolean} True if valid, throws error if not
     */
    validate() {
        // Re-run all validations
        try {
            // Check all required properties exist
            if (!this.question || !this.answers || !this.category || !this.difficulty || !this.correctAnswer) {
                throw new Error('Missing required question properties')
            }
            
            // Check answers array length
            if (this.answers.length !== 4) {
                throw new Error('Question must have exactly 4 answers')
            }
            
            // Check correct answer is valid
            if (!this.validCorrectAnswers.includes(this.correctAnswer)) {
                throw new Error(`Invalid correct answer: ${this.correctAnswer}`)
            }
            
            // Check difficulty is valid
            if (!this.validDifficulties.includes(this.difficulty)) {
                throw new Error(`Invalid difficulty: ${this.difficulty}`)
            }
            
            return true
        } catch (error) {
            console.error('Question validation failed:', error.message)
            throw error
        }
    }
}

// Expose Question class for use in other modules
window.Question = Question