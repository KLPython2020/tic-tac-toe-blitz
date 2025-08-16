class Question{
    constructor(Question, Answers, Category, Difficulty, CorrectAnswer) {
        this.validCorrectAnswers =  ['A', 'B', 'C', 'D']
        this.validDifficulties = ['easy', 'medium', 'hard']
        if (!this.validDifficulties.includes(Difficulty.toLowerCase())) {
            throw new Error(`${Difficulty} is not a valid difficulty. It should be 'easy', 'medium', or 'hard'`)
        }
        if (typeof Question !== 'string' || Question.trim() === '') {
            throw new Error('Question must be a non-empty string')
        }
        if (!Array.isArray(Answers) || Answers.length !== 4) {
            throw new Error('Answers must be an array of 4 strings')
        }
        Answers.forEach((answer, index) => {
            if (typeof answer !== 'string' || answer.trim() === '') {
                throw new Error(`Answer ${index + 1} must be a non-empty string and format ['answer1', 'answer2', 'answer3', 'answer4']`)
            }
        })         
        if (typeof CorrectAnswer !== 'string' || !this.validCorrectAnswers.includes(CorrectAnswer.toUpperCase())) {
            throw new Error(`${CorrectAnswer} is not a valid answer. It should be 'A', 'B', 'C', or 'D'`)
        }
        if(typeof Category !== 'string' || Category.trim() === '') {
            throw new Error(`Category must be a non-empty string  `)
        }
    
        this.question = Question
        this.answers = Answers
        this.category = Category.toLowerCase()
        this.difficulty = Difficulty.toLowerCase()
        this.correctAnswer = CorrectAnswer.toUpperCase()
    }
    isCorrect(answer){
        
        if (typeof answer !== 'string') return false
        return this.correctAnswer === answer.toUpperCase()
    }
    getAnswers() {
        // Answers to be listed [A : answer1, B : answer2, C : answer3, D : answer4]
        
        const formattedAnswers = {}
        this.answers.forEach((answer, index) => {
            formattedAnswers[this.validCorrectAnswers[index]] = answer
        })
        return formattedAnswers
    }
}

if(typeof module !== 'undefined') {
    module.exports = Question
}