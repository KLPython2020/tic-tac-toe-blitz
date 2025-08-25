# Tic Tac Toe Blitz - Project Overview

## 🎮 Project Description
**Tic Tac Toe Blitz** is a high-intensity, knowledge-based twist on the classic Tic Tac Toe game. Players must answer trivia questions to save their lives when they hit bombs on the game board. The game features a 5-second timer pressure, random bomb questions, and a lives system.

## 📁 Project Structure

### 🌐 Web Version (Main Application)
The primary web-based game accessible through `index.html`

#### Core Files
- **`index.html`** - Main HTML structure with game interface, modals, and overlays
- **`js/app.js`** - Main application controller (1146 lines)
- **`js/game.js`** - Core game logic and state management (883 lines)
- **`js/board.js`** - Game board representation and logic (342 lines)
- **`js/question.js`** - Question class for trivia questions (147 lines)
- **`js/questionBank.js`** - Question management and selection (404 lines)
- **`js/questionsData.js`** - Database of trivia questions (355 lines)
- **`js/audio.js`** - Sound effects and background music system (299 lines)
- **`js/ui.js`** - UI helper functions and utilities (335 lines)

#### Styling
- **`styles/base.css`** - CSS variables, resets, and base animations (197 lines)
- **`styles/layout.css`** - Page layout and positioning
- **`styles/components.css`** - UI component styling
- **`styles/effects.css`** - Visual effects and animations

### 💻 Terminal Version
A Node.js-based version for command-line testing and development

#### Files
- **`terminalProg/board.js`** - Terminal-adapted board class (3.4KB, 114 lines)
- **`terminalProg/game.js`** - Terminal-adapted game class (11KB, 314 lines)
- **`terminalProg/question.js`** - Terminal-adapted question class (2.1KB, 50 lines)
- **`terminalProg/questionBank.js`** - Terminal-adapted question bank (1.9KB, 54 lines)
- **`terminalProg/questionsData.js`** - Question data for terminal version (2.7KB, 101 lines)
- **`terminalProg/test.js`** - Testing suite for terminal version (3.4KB, 109 lines)

### 🧪 Testing & Development
- **`test.js`** - Additional testing utilities
- **`debug/taskList.md`** - Development task tracking

## 🏗️ Architecture Overview

### Core Classes

#### 1. **TicTacToeBlitzApp** (`app.js`)
- **Purpose**: Main application controller and entry point
- **Responsibilities**:
  - Application initialization and lifecycle management
  - Settings and statistics management
  - Global event handling
  - Component coordination
- **Key Features**:
  - Session-persistent statistics (localStorage)
  - Per-game question tracking
  - Settings management (sound, timer, lives, difficulty)
  - Start screen and game flow control

#### 2. **Game** (`game.js`)
- **Purpose**: Core game logic and state management
- **Responsibilities**:
  - Game state tracking (current player, lives, board state)
  - Turn management and timer system
  - Move validation and execution
  - Question triggering and life management
  - Game end conditions
- **Key Features**:
  - 5-second turn timer with pause/resume
  - Lives system (3 lives per player)
  - Bomb and question mechanics
  - Race condition prevention
  - Question caching system

#### 3. **Board** (`board.js`)
- **Purpose**: Game board representation and logic
- **Responsibilities**:
  - 3x3 grid management
  - Cell state tracking (empty, player marks, bombs, questions)
  - Win condition checking
  - Board validation
- **Key Features**:
  - Support for multiple cell types (X, O, bombs, questions)
  - Tie condition logic
  - Playable cell detection
  - Cell counting and statistics

#### 4. **Question** (`question.js`)
- **Purpose**: Individual trivia question representation
- **Responsibilities**:
  - Question data validation
  - Answer checking
  - Difficulty and category management
- **Key Features**:
  - 4 multiple-choice answers (A, B, C, D)
  - Difficulty levels (easy, medium, hard)
  - Category classification
  - Input validation and error handling

#### 5. **QuestionBank** (`questionBank.js`)
- **Purpose**: Question management and selection system
- **Responsibilities**:
  - Question pool management
  - Random question selection
  - Used question tracking
  - Question loading and caching
- **Key Features**:
  - Maximum 25 questions per game
  - Minimum 5 questions required
  - Question rotation (no repeats in same game)
  - Lazy loading of question data

#### 6. **AudioSystem** (`audio.js`)
- **Purpose**: Sound effects and background music
- **Responsibilities**:
  - Web Audio API management
  - Sound effect generation
  - Background music loops
  - Volume control
- **Key Features**:
  - Procedurally generated sounds
  - Background music system
  - Sound effect categories (life saved, life lost, etc.)
  - Audio context management

#### 7. **QuestionUI** (part of `questionBank.js`)
- **Purpose**: User interface for trivia questions
- **Responsibilities**:
  - Question modal display
  - Answer button generation
  - User interaction handling
  - Sound callback integration
- **Key Features**:
  - Modal-based question display
  - Dynamic answer button generation
  - Accessibility support
  - Sound feedback integration

### UI Components

#### 1. **Game Interface**
- **Header**: Global statistics and control buttons
- **Lives Section**: Player health display with statistics
- **Timer Section**: Turn countdown with progress bar
- **Game Board**: 3x3 grid with hover effects
- **Control Panel**: New game, pause, end game, settings, sound

#### 2. **Modals & Overlays**
- **Start Screen**: Game introduction and feature overview
- **Question Modal**: Trivia question display with answer choices
- **Game Over Modal**: Results, statistics, and replay options
- **Settings Modal**: Game configuration options
- **Pause Overlay**: Game pause state
- **Loading Overlay**: Loading states

#### 3. **Visual Effects**
- **Gradient Backgrounds**: Dynamic color schemes
- **Glass Morphism**: Modern UI design elements
- **Animations**: Smooth transitions and hover effects
- **Responsive Design**: Mobile and desktop compatibility

## 🎯 Game Mechanics

### Core Gameplay
1. **Turn-based Play**: Players take turns placing X or O on the board
2. **Timer Pressure**: 5-second limit per turn
3. **Lives System**: Each player starts with 3 lives
4. **Bomb Mechanics**: Random cells contain bombs that trigger questions
5. **Question System**: Answering correctly saves a life, wrong answers lose a life

### Win Conditions
- **Traditional Win**: Three in a row (horizontal, vertical, or diagonal)
- **Life Depletion**: Opponent runs out of lives
- **Tie**: Board fills with only player marks (no bombs/questions)

### Question System
- **Categories**: Math, Science, Geography, History, etc.
- **Difficulties**: Easy, Medium, Hard, Mixed
- **Format**: Multiple choice with 4 options
- **Scoring**: Correct = life saved, Incorrect = life lost

## 🔧 Technical Features

### Browser Compatibility
- Modern web browsers with ES6+ support
- Web Audio API for sound effects
- CSS Grid and Flexbox for layout
- Local Storage for persistence

### Performance Optimizations
- Question caching system
- Efficient DOM manipulation
- Optimized animations and transitions
- Memory management for audio contexts

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- High contrast support

### Mobile Responsiveness
- Touch-friendly interface
- Responsive grid layouts
- Mobile-optimized controls
- Viewport management

## 🚀 Development Features

### Testing Suite
- **Terminal Version**: Command-line testing with Node.js
- **Test Functions**: Basic setup, moves, bomb hits, questions
- **Validation**: Question creation, difficulty levels, answer checking

### Debug Tools
- **Console Logging**: Comprehensive logging throughout the application
- **Error Handling**: Graceful error handling and user feedback
- **Development Mode**: Enhanced debugging information

### Code Organization
- **Modular Architecture**: Separated concerns and responsibilities
- **ES6 Classes**: Modern JavaScript class structure
- **Async/Await**: Modern asynchronous programming patterns
- **Event-Driven**: Clean event handling and callbacks

## 📊 Statistics & Analytics

### Game Statistics
- Games played
- Player wins (X vs O)
- Ties
- Questions answered correctly/incorrectly
- Game duration tracking

### Session Persistence
- Local storage for statistics
- Settings persistence
- Game state recovery

## 🔮 Future Enhancements

### Potential Features
- Multiplayer support
- Leaderboards
- Additional question categories
- Custom difficulty settings
- Sound customization
- Theme selection
- Export/import statistics

### Technical Improvements
- Service Worker for offline support
- Progressive Web App features
- Enhanced audio system
- Performance optimizations
- Additional accessibility features

## 📝 Development Notes

### Code Quality
- Comprehensive error handling
- Input validation
- Memory leak prevention
- Performance considerations
- Accessibility compliance

### Browser Support
- Modern ES6+ features
- Web Audio API
- CSS Grid/Flexbox
- Local Storage
- Touch events

### Testing Strategy
- Terminal version for logic testing
- Browser testing for UI/UX
- Cross-browser compatibility
- Mobile device testing
- Accessibility testing

---

*This project demonstrates modern web development practices with a focus on user experience, accessibility, and maintainable code architecture.*
