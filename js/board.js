// browser-board.js - Board class adapted for browser/DOM
class Board {
    constructor() {
        this.PLAYER1 = 'X';
        this.PLAYER2 = 'O';
        this.EMPTY = 'E';
        this.BOMB = 'B';
        this.CACHE = '?';
        
        this.grid = [
            [this.EMPTY, this.EMPTY, this.EMPTY],
            [this.EMPTY, this.EMPTY, this.EMPTY],
            [this.EMPTY, this.EMPTY, this.EMPTY]
        ];
    }
    
    // Core game logic methods (unchanged)
    isCellEmpty(row, col) {
        return this.grid[row][col] === this.EMPTY;
    }
    
    placeMark(row, col, player, force = false) {
        if (this.isCellEmpty(row, col) || force) {
            this.grid[row][col] = player;
            return true;
        }
        return false;
    }
    
    checkWinner() {
        const winner = this.findWinner();
        if (winner) return `${winner} wins!`;
        return this.isBoardFull() ? `It's a tie!` : null;
    }
    
    /**
     * FIXED: Check if board is full with only players (for tie condition)
     * A tie can only occur when ALL cells contain ONLY players (X or O)
     * Cells with bombs or cached questions do NOT count toward a tie
     */
    isBoardFull() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.grid[row][col];
                // If any cell is empty, bomb, or cached question, board is not full for tie purposes
                if (cell === this.EMPTY || cell === this.BOMB || cell === this.CACHE) {
                    return false;
                }
                // Cell must be either PLAYER1 or PLAYER2 for a valid tie
                if (cell !== this.PLAYER1 && cell !== this.PLAYER2) {
                    return false;
                }
            }
        }
        return true; // All cells contain only players
    }
    
    /**
     * NEW: Check if there are any playable cells left
     * A cell is playable if it's empty, a bomb, or a cached question
     */
    hasPlayableCells() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.grid[row][col];
                if (cell === this.EMPTY || cell === this.BOMB || cell === this.CACHE) {
                    return true;
                }
            }
        }
        return false;
    }
    
    /**
     * NEW: Get count of different cell types
     */
    getCellCounts() {
        const counts = {
            empty: 0,
            playerX: 0,
            playerO: 0,
            bombs: 0,
            cached: 0,
            total: 9
        };
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.grid[row][col];
                switch (cell) {
                    case this.EMPTY:
                        counts.empty++;
                        break;
                    case this.PLAYER1:
                        counts.playerX++;
                        break;
                    case this.PLAYER2:
                        counts.playerO++;
                        break;
                    case this.BOMB:
                        counts.bombs++;
                        break;
                    case this.CACHE:
                        counts.cached++;
                        break;
                }
            }
        }
        
        counts.playable = counts.empty + counts.bombs + counts.cached;
        counts.players = counts.playerX + counts.playerO;
        
        return counts;
    }
    
    /**
     * ENHANCED: Find winner with better cached question handling
     * Cached questions should not block winner detection entirely
     */
    findWinner() {
        // Check rows
        for (let row = 0; row < 3; row++) {
            const result = this.checkLineForWinner([
                this.grid[row][0], 
                this.grid[row][1], 
                this.grid[row][2]
            ]);
            if (result) return result;
        } 
        
        // Check columns
        for (let col = 0; col < 3; col++) {
            const result = this.checkLineForWinner([
                this.grid[0][col],
                this.grid[1][col], 
                this.grid[2][col]
            ]);
            if (result) return result;
        }
        
        // Check diagonal (top-left to bottom-right)
        const result1 = this.checkLineForWinner([
            this.grid[0][0],
            this.grid[1][1],
            this.grid[2][2]
        ]);
        if (result1) return result1;
        
        // Check diagonal (top-right to bottom-left)
        const result2 = this.checkLineForWinner([
            this.grid[0][2],
            this.grid[1][1],
            this.grid[2][0]
        ]);
        if (result2) return result2;
        
        return null;
    }
    
    /**
     * NEW: Check a line of three cells for a winner
     * A line wins if it has 3 of the same player (ignoring cached questions for now)
     */
    checkLineForWinner(line) {
        // Count players in this line
        const playerCount = {
            [this.PLAYER1]: 0,
            [this.PLAYER2]: 0
        };
        
        let nonPlayerCells = 0;
        
        line.forEach(cell => {
            if (cell === this.PLAYER1) {
                playerCount[this.PLAYER1]++;
            } else if (cell === this.PLAYER2) {
                playerCount[this.PLAYER2]++;
            } else {
                // Empty, bomb, or cached question
                nonPlayerCells++;
            }
        });
        
        // Traditional win: 3 of the same player
        if (playerCount[this.PLAYER1] === 3) {
            return this.PLAYER1;
        }
        if (playerCount[this.PLAYER2] === 3) {
            return this.PLAYER2;
        }
        
        // No winner in this line
        return null;
    }
    
    // Browser-specific methods for DOM updates
    getCellState(row, col) {
        return this.grid[row][col];
    }
    
    getCellDisplayData(row, col) {
        const state = this.grid[row][col];
        
        switch (state) {
            case this.EMPTY:
                return { text: '', className: '', isEmpty: true };
            case this.PLAYER1:
                return { text: 'X', className: 'player-x', isEmpty: false };
            case this.PLAYER2:
                return { text: 'O', className: 'player-o', isEmpty: false };
            case this.BOMB:
                return { text: 'ðŸ’£', className: 'bomb', isEmpty: false };
            case this.CACHE:
                return { text: '?', className: 'cached-question', isEmpty: false };
            default:
                return { text: '', className: '', isEmpty: true };
        }
    }
    
    getAllCellsData() {
        const cellsData = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                cellsData.push({
                    row,
                    col,
                    ...this.getCellDisplayData(row, col)
                });
            }
        }
        return cellsData;
    }
    
    getWinningCells() {
        // Returns coordinates of winning cells for highlighting
        const winner = this.findWinner();
        if (!winner) return [];
        
        // Check rows
        for (let row = 0; row < 3; row++) {
            if (this.grid[row][0] === winner && 
                this.grid[row][1] === winner && 
                this.grid[row][2] === winner) {
                return [[row, 0], [row, 1], [row, 2]];
            }
        }
        
        // Check columns
        for (let col = 0; col < 3; col++) {
            if (this.grid[0][col] === winner && 
                this.grid[1][col] === winner && 
                this.grid[2][col] === winner) {
                return [[0, col], [1, col], [2, col]];
            }
        }
        
        // Check diagonals
        if (this.grid[0][0] === winner && 
            this.grid[1][1] === winner && 
            this.grid[2][2] === winner) {
            return [[0, 0], [1, 1], [2, 2]];
        }
        
        if (this.grid[0][2] === winner && 
            this.grid[1][1] === winner && 
            this.grid[2][0] === winner) {
            return [[0, 2], [1, 1], [2, 0]];
        }
        
        return [];
    }
    
    /**
     * NEW: Get all playable cell coordinates
     */
    getPlayableCells() {
        const playableCells = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const cell = this.grid[row][col];
                if (cell === this.EMPTY || cell === this.BOMB || cell === this.CACHE) {
                    playableCells.push([row, col]);
                }
            }
        }
        return playableCells;
    }
    
    /**
     * NEW: Check if game should end due to no playable moves
     * This can happen if all cells are filled with players but no winner exists
     * OR if players run out of lives but there are still playable cells
     */
    isGameStuck(playerXLives, playerOLives) {
        const counts = this.getCellCounts();
        
        // If both players are out of lives, game is stuck
        if (playerXLives <= 0 && playerOLives <= 0) {
            return true;
        }
        
        // If no playable cells remain and no winner, it's a stalemate
        if (counts.playable === 0 && !this.findWinner()) {
            return true;
        }
        
        return false;
    }
    
    // Utility method for debugging
    getGridState() {
        return this.grid.map(row => [...row]); // Deep copy
    }
    
    /**
     * Enhanced grid state for debugging
     */
    getDetailedGridState() {
        const counts = this.getCellCounts();
        return {
            grid: this.getGridState(),
            counts: counts,
            winner: this.findWinner(),
            isFull: this.isBoardFull(),
            hasPlayableCells: this.hasPlayableCells(),
            playableCells: this.getPlayableCells(),
            winningCells: this.getWinningCells()
        };
    }
    
    // Reset board for new game
    reset() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                this.grid[row][col] = this.EMPTY;
            }
        }
    }
}

// Expose Board class for use in other modules
window.Board = Board