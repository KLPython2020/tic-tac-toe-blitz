// questions-data.js - Enhanced question bank with more variety and better organization
const questionsData = [
    // Easy Math Questions
    {
        id: 1,
        question: "What is 7 Ã— 8?",
        answers: ["54", "56", "58", "64"],
        correctAnswer: "B",
        category: "Math",
        difficulty: "Easy"
    },
    {
        id: 2,
        question: "What is the area of a rectangle with length 6 and width 4?",
        answers: ["20", "24", "26", "28"],
        correctAnswer: "B",
        category: "Math",
        difficulty: "Easy"
    },
    {
        id: 10,
        question: "What is the square root of 144?",
        answers: ["11", "12", "13", "14"],
        correctAnswer: "B",
        category: "Math",
        difficulty: "Easy"
    },
    {
        id: 12,
        question: "What is 25% of 80?",
        answers: ["15", "20", "25", "30"],
        correctAnswer: "B",
        category: "Math",
        difficulty: "Easy"
    },

    // Medium Math Questions
    {
        id: 7,
        question: "Solve for x: 2x + 5 = 13",
        answers: ["3", "4", "5", "6"],
        correctAnswer: "B",
        category: "Algebra",
        difficulty: "Medium"
    },
    {
        id: 13,
        question: "What is 15Â² (15 squared)?",
        answers: ["200", "215", "225", "235"],
        correctAnswer: "C",
        category: "Math",
        difficulty: "Medium"
    },
    {
        id: 14,
        question: "If a triangle has angles of 60Â° and 70Â°, what is the third angle?",
        answers: ["40Â°", "50Â°", "60Â°", "70Â°"],
        correctAnswer: "B",
        category: "Geometry",
        difficulty: "Medium"
    },

    // Science Questions
    {
        id: 3,
        question: "Which organelle is responsible for photosynthesis in plant cells?",
        answers: ["Mitochondria", "Nucleus", "Chloroplast", "Ribosome"],
        correctAnswer: "C",
        category: "Biology",
        difficulty: "Medium"
    },
    {
        id: 6,
        question: "What is the chemical symbol for gold?",
        answers: ["Go", "Gd", "Au", "Ag"],
        correctAnswer: "C",
        category: "Chemistry",
        difficulty: "Medium"
    },
    {
        id: 8,
        question: "Which planet is closest to the Sun?",
        answers: ["Venus", "Earth", "Mercury", "Mars"],
        correctAnswer: "C",
        category: "Astronomy",
        difficulty: "Easy"
    },
    {
        id: 15,
        question: "What gas do plants absorb from the atmosphere during photosynthesis?",
        answers: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
        correctAnswer: "C",
        category: "Biology",
        difficulty: "Easy"
    },
    {
        id: 16,
        question: "What is the chemical formula for water?",
        answers: ["H2O", "CO2", "NaCl", "O2"],
        correctAnswer: "A",
        category: "Chemistry",
        difficulty: "Easy"
    },

    // Geography Questions
    {
        id: 4,
        question: "What is the capital of Australia?",
        answers: ["Sydney", "Melbourne", "Canberra", "Perth"],
        correctAnswer: "C",
        category: "Geography",
        difficulty: "Medium"
    },
    {
        id: 11,
        question: "Which continent is Brazil located in?",
        answers: ["North America", "South America", "Africa", "Asia"],
        correctAnswer: "B",
        category: "Geography",
        difficulty: "Easy"
    },
    {
        id: 17,
        question: "Which is the longest river in the world?",
        answers: ["Amazon River", "Nile River", "Mississippi River", "Yangtze River"],
        correctAnswer: "B",
        category: "Geography",
        difficulty: "Medium"
    },
    {
        id: 18,
        question: "What is the smallest country in the world?",
        answers: ["Monaco", "Malta", "Vatican City", "San Marino"],
        correctAnswer: "C",
        category: "Geography",
        difficulty: "Medium"
    },

    // History Questions
    {
        id: 5,
        question: "In which year did World War II end?",
        answers: ["1944", "1945", "1946", "1947"],
        correctAnswer: "B",
        category: "History",
        difficulty: "Easy"
    },
    {
        id: 19,
        question: "Who was the first person to walk on the moon?",
        answers: ["Buzz Aldrin", "Neil Armstrong", "John Glenn", "Alan Shepard"],
        correctAnswer: "B",
        category: "History",
        difficulty: "Easy"
    },
    {
        id: 20,
        question: "In which year did the Berlin Wall fall?",
        answers: ["1987", "1988", "1989", "1990"],
        correctAnswer: "C",
        category: "History",
        difficulty: "Medium"
    },

    // Language/English Questions
    {
        id: 9,
        question: "What is the past tense of the verb 'to go'?",
        answers: ["Goed", "Gone", "Went", "Going"],
        correctAnswer: "C",
        category: "English",
        difficulty: "Easy"
    },
    {
        id: 21,
        question: "Which word is a synonym for 'happy'?",
        answers: ["Sad", "Joyful", "Angry", "Tired"],
        correctAnswer: "B",
        category: "English",
        difficulty: "Easy"
    },
    {
        id: 22,
        question: "What is the plural of 'child'?",
        answers: ["Childs", "Childes", "Children", "Childrens"],
        correctAnswer: "C",
        category: "English",
        difficulty: "Easy"
    },

    // General Knowledge
    {
        id: 23,
        question: "How many days are there in a leap year?",
        answers: ["364", "365", "366", "367"],
        correctAnswer: "C",
        category: "General Knowledge",
        difficulty: "Easy"
    },
    {
        id: 24,
        question: "What is the hardest natural substance on Earth?",
        answers: ["Gold", "Iron", "Diamond", "Quartz"],
        correctAnswer: "C",
        category: "General Knowledge",
        difficulty: "Medium"
    },
    {
        id: 25,
        question: "Which mammal is known to have the most powerful bite in the world?",
        answers: ["Shark", "Crocodile", "Hippopotamus", "Lion"],
        correctAnswer: "C",
        category: "General Knowledge",
        difficulty: "Medium"
    }
];

/**
 * Get questions by difficulty level
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Array} Filtered questions
 */
function getQuestionsByDifficulty(difficulty) {
    return questionsData.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
}

/**
 * Get questions by category
 * @param {string} category - Category name
 * @returns {Array} Filtered questions
 */
function getQuestionsByCategory(category) {
    return questionsData.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get random questions
 * @param {number} count - Number of questions to return
 * @param {string} difficulty - Optional difficulty filter
 * @param {string} category - Optional category filter
 * @returns {Array} Random questions
 */
function getRandomQuestions(count = 10, difficulty = null, category = null) {
    let filteredQuestions = [...questionsData];
    
    if (difficulty) {
        filteredQuestions = filteredQuestions.filter(q => 
            q.difficulty.toLowerCase() === difficulty.toLowerCase()
        );
    }
    
    if (category) {
        filteredQuestions = filteredQuestions.filter(q => 
            q.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    // Shuffle and return requested count
    const shuffled = filteredQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Get all available categories
 * @returns {Array} List of unique categories
 */
function getAvailableCategories() {
    const categories = [...new Set(questionsData.map(q => q.category))];
    return categories.sort();
}

/**
 * Get all available difficulty levels
 * @returns {Array} List of unique difficulty levels
 */
function getAvailableDifficulties() {
    const difficulties = [...new Set(questionsData.map(q => q.difficulty))];
    return difficulties.sort();
}

/**
 * Get question bank statistics
 * @returns {Object} Statistics about the question bank
 */
function getQuestionBankStats() {
    const stats = {
        total: questionsData.length,
        byDifficulty: {},
        byCategory: {},
        categories: getAvailableCategories(),
        difficulties: getAvailableDifficulties()
    };
    
    // Count by difficulty
    questionsData.forEach(q => {
        const diff = q.difficulty.toLowerCase();
        stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
    });
    
    // Count by category
    questionsData.forEach(q => {
        const cat = q.category.toLowerCase();
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
    });
    
    return stats;
}

/**
 * Validate all questions in the data
 * @returns {Object} Validation results
 */
function validateQuestionBank() {
    const results = {
        valid: 0,
        invalid: 0,
        errors: []
    };
    
    questionsData.forEach((questionData, index) => {
        try {
            // Try to create a Question object to validate
            new Question(
                questionData.question,
                questionData.answers,
                questionData.category,
                questionData.difficulty,
                questionData.correctAnswer
            );
            results.valid++;
        } catch (error) {
            results.invalid++;
            results.errors.push({
                index,
                id: questionData.id,
                error: error.message
            });
        }
    });
    
    return results;
}

// Expose questionsData and utility functions for use in other modules
window.questionsData = questionsData;
window.getQuestionsByDifficulty = getQuestionsByDifficulty;
window.getQuestionsByCategory = getQuestionsByCategory;
window.getRandomQuestions = getRandomQuestions;
window.getAvailableCategories = getAvailableCategories;
window.getAvailableDifficulties = getAvailableDifficulties;
window.getQuestionBankStats = getQuestionBankStats;
window.validateQuestionBank = validateQuestionBank;

// Log question bank stats on load
console.log('Question Bank Loaded:', getQuestionBankStats());