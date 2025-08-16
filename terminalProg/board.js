class Board {
    constructor(){
        this.PLAYER1 = 'X'
        this.PLAYER2 = 'O'
        this.EMPTY = 'E'
        this.BOMB = 'B'
        this.CACHE = '?'
        
        this.grid = [
            [ this.EMPTY, this.EMPTY, this.EMPTY],
            [this.EMPTY, this.EMPTY, this.EMPTY],
            [this.EMPTY, this.EMPTY, this.EMPTY]
        ]
    }
    displayBoard() {
        console.log('\n=== Current Board ===')
        console.log('   0   1   2')
        for (let row = 0; row < 3; row++) {
            let rowDisplay = `${row} `
            for (let col = 0; col < 3; col++) {
                let cell = this.grid[row][col]
                // Make display more readable
                if (cell === this.EMPTY) cell = ' '
                rowDisplay += ` ${cell} `
                if (col < 2) rowDisplay += '|'
            }
            console.log(rowDisplay)
            if (row < 2) console.log('  ---|---|---')
        }
        console.log('===================\n')
    }
    isCellEmpty(row, col) {
        return this.grid[row][col] === this.EMPTY
    }

    placeMark(row, col, player, force = false){
        if (this.isCellEmpty(row, col) || force){
            this.grid[row][col] = player
            return true
        }
        return false
    }
    checkWinner(){
        const winner = this.findWinner()
        if (winner) return `${winner} wins!`
        return this.isBoardFull() ? `It's a tie!` : null
    }
    isBoardFull(){
        // Approach 1: Using nested loops (which I believe is faster)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
               // Consider empty cells AND bombs as playable
                if (this.grid[row][col] === this.EMPTY || 
                    this.grid[row][col] === this.BOMB) {
                    return false
                }
            }
        }
        return true
        // Approach 2: Using array methods 
        // return this.grid.every(
        //     row => {
        //        return row.every(cell => cell !== this.EMPTY)
        //     }
        // )
    }
    findWinner() {
        
        // Check rows
        for(let row = 0; row < 3; row++){
            const cell = this.grid[row][0]
            if(
                (cell === this.PLAYER1 || cell === this.PLAYER2) &&
                cell === this.grid[row][1] &&
                cell === this.grid[row][2]
            ) {
                return cell
            }
        } 
        // Check columns
        for(let col = 0; col < 3; col++){
            const cell = this.grid[0][col]
            if(
                (cell === this.PLAYER1 || cell === this.PLAYER2) &&
                cell === this.grid[1][col] &&
                cell === this.grid[2][col]
            ) {
                return cell
            }
        }
        if(
            
            (this.grid[0][0] === this.PLAYER1 || this.grid[0][0] === this.PLAYER2) &&
            this.grid[0][0] === this.grid[1][1] &&
            this.grid[0][0] === this.grid[2][2]
        ) {
            return this.grid[0][0]
        }
        if(
            (this.grid[0][2] === this.PLAYER1 || this.grid[0][2] === this.PLAYER2) &&
            this.grid[0][2] === this.grid[1][1] &&
            this.grid[0][2] === this.grid[2][0]
        ) {
            return this.grid[0][2]
        }
        return null
    }
}

if (typeof module !== 'undefined') {
    module.exports = Board
 }

