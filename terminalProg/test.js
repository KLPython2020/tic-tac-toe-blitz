const Game = require('./game.js')
const Question = require('./question.js');
const QuestionBank = require('./questionBank.js')

function testBasicSetup() {
    console.log("=== Testing Basic Setup ===");
    const game = new Game();
    console.log("Current player:", game.currentPlayer);
    console.log("Lives:", game.lives);
    console.log("Game active:", game.isGameActive);
    console.log("Grid:", game.BOARD.grid);
}
function testBasicMoves() {
    console.log("\n=== Testing Basic Moves ===");
    const game = new Game();
    
    // Clear the timer to prevent auto-expiration during our test
    // clearTimeout(game.timerID);
    
    console.log("Making moves manually...");
    game.makeMove(0, 0); // X
    console.log("After X move - Current player:", game.currentPlayer);
    
    game.makeMove(1, 1); // O  
    console.log("After O move - Current player:", game.currentPlayer);
    
    console.log("Final grid:");
    console.log(game.BOARD.grid);
}
function testBombHit() {
    console.log("\n=== Testing Bomb Hit ===");
    const game = new Game();
    clearTimeout(game.timerID);
    
    // Manually place a bomb
    game.BOARD.placeMark(1, 1, game.BOARD.BOMB);
    console.log("Placed bomb at (1,1)");
    
    console.log("X lives before bomb hit:", game.lives[game.currentPlayer]);
    game.makeMove(1, 1); // Hit the bomb
    console.log("X lives after bomb hit:", game.lives['X']);
}
function testQuestion() {
    // Test valid question
    try {
        const testQuestion = new Question(
            "What is the capital of France?",
            ["London", "Berlin", "Paris", "Madrid"],
            "Geography",
            "Easy", 
            "C"
        );
        
        console.log("✅ Question created successfully!");
        console.log("Question:", testQuestion.question);
        console.log("Category:", testQuestion.category);
        console.log("Difficulty:", testQuestion.difficulty);
        console.log("Correct Answer:", testQuestion.correctAnswer);
        console.log("Formatted answers:", testQuestion.getAnswers());
        console.log("Is 'C' correct?", testQuestion.isCorrect("C"));
    } catch (error) {
        console.log("❌ Error:", error.message);
    }

    // Test invalid difficulty
    try {
        const badQuestion = new Question("Test?", ["A", "B", "C", "D"], "Math", "SUPER_HARD", "A");
    } catch (error) {
        console.log("✅ Correctly caught difficulty error:", error.message);
    }
} 
function testQuestionBank() {
    console.log("=== Testing Basic Setup ===")

    
        const bank = new QuestionBank()

        // Add some question IDs
        for (let i = 1; i <= 10; i++) {
        bank.addQuestion(i)
        }

        console.log("Available questions:", bank.questions.length)

        // Get and use some questions
        const q1 = bank.getRandomQuestion()
        console.log("Selected question ID:", q1)

        bank.markQuestionAsUsed(q1)
        console.log("Available after using one:", bank.questions.length)
        console.log("Used questions:", bank.usedQuestions.size)

        // Test reset
        bank.reset()
        console.log("After reset - Available:", bank.questions.length, "Used:", bank.usedQuestions.size)
}
async function startGame() {
    const game = new Game();
    await game.startGame();
}

startGame();

// Run the test
// testBasicSetup();
// testBasicMoves()
// testBombHit()
// testQuestion()
// testQuestionBank()