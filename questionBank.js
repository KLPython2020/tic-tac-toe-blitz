const Question = require('./question.js')

class QuestionBank {
    constructor() {
        this.questions = []
        this.usedQuestions = new Set()
        this.maxQuestions = 25
        this.minQuestions = 5
    }
    isFull() {
        return this.questions.length === this.maxQuestions
    }
    isQuestionsLoaded() {
        if (this.questions.length >= this.minQuestions && this.questions.length <= this.maxQuestions){
            console.log(`Question bank is loaded with ${this.questions.length} questions. and is ready to go1`)
            return true
        }
        throw new Error(`Question bank is not loaded with enough questions. It should be between ${this.minQuestions} and ${this.maxQuestions} questions.`)
    }
    addQuestion(questionId) {
        if (this.isFull()){
           throw new Error(`Cannot add more than ${this.maxQuestions} questions`)
        }
        this.questions.push(questionId)
    }
    getRandomQuestion(){
        if (this.questions.length === 0) {
            console.log("No questions available in the bank.")
            return null
        }
        const randomIndex = Math.floor(Math.random() * this.questions.length) 
        return this.questions[randomIndex] 
    }
    markQuestionAsUsed(questionId) {
        if (!this.usedQuestions.has(questionId)){
            this.usedQuestions.add(questionId)
           // remove question from available questions
            this.questions = this.questions.filter(qId => qId !== questionId)
            console.log(`Question ID ${questionId} marked as used.`)
            return true
        }
        console.log(`Question ID ${questionId} has already been used.`)
        return false   
    }
    reset(){
        this.questions = []
        this.usedQuestions.clear()
        console.log("Question bank has been reset.")
    }
}

if (typeof module !== 'undefined') {
    module.exports = QuestionBank
}