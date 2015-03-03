import util from 'util/core';

export default class Player {
  constructor(config) {
    this.index = config.index;
    this.name  = config.name || `Player ${this.index}`;
    this.type  = config.type || 'AI';
    this.moves = [];
    this.longestChain = [];

    if (this.type !== 'AI') return;

    this.difficulty = config.difficulty;
    this.errorFactor = 0.1 * util.randomFloat(
      this.difficulty == 'easy'? 6.66: this.difficulty == 'medium'? 3.33: 0,
      this.difficulty == 'easy'? 10.0: this.difficulty == 'medium'? 6.66: 3.33
    );
    this.errorFactor = this.difficulty == 'impossible'? 0: this.errorFactor;
  }

  beginMove() {

    return this;
  }

  makeMove(grid, column) {
    this.moves.push(grid.insertPiece(column, this.index));
    return this;
  }

  endMove(grid) {
    this.longestChain = this.findLongestChain(grid, grid.nConnect);

    if (this.longestChain.length == grid.nConnect) {
      return alert('win!');
    }
    return this;
  }

  findLongestChain(grid, max) {
    let longestChain = [];
    // We'll move from chains staring at length of two up to the max number
    for (let i = 2, l = max; i < l; i++) {
      // Now we'll go though all the player's moves
      for (let j = 0, move; move = this.moves[j]; j++) {
        const chain = grid.makeChainFromPoint(move.x, move.y, this.index, i);
        if (chain.length > longestChain.length) {
          longestChain = chain;
        }
      }
    }

    return longestChain;
  }

  // The Algorithm that the AI follows is pretty simple.
  // If a step fails it proceeds to the following step.
  //
  // (1) It tests its error factor (derived from its difficulty level)
  //     against a random number and if is within a specified range it 
  //     malfunctions and drops a piece randomly.
  //
  // (2) It searches for any player, including itself, that is 
  //     one play away from winning. It then either blocks the
  //     other player from winning or attempts to win.
  //
  // (3) It searches for a chain of pieces that it has previously made
  //     and adds to it if it is possible and can eventually lead to a
  //     win scenario.
  //
  // (4) It starts a chain by finding a previously laid piece.
  // 
  // (5) It searches for a chain another player is making and blocks it. 
  //
  // (6) It places a piece randomly.
  //
  decideMove(grid, players) {
    console.log(players[0], players[0].longestChain)
    // (1)
    if (Math.random() < this.errorFactor) {
      return this.makeMove(grid, util.randomInt(0, grid.columns-1));
    }

    // (2)
    for (let i = 0, player; player = players[i]; i++) {
      if (player.longestChain.length == grid.nConnect-1) {
        const data = grid.findChainContinuingColumn(player.longestChain);
        if (data.x > -1) return this.makeMove(grid, data.x);
      }
    }

    // (3) TODO incomplete
    if (this.longestChain > 1) {
      const data = grid.findChainContinuingColumn(this.longestChain);
      const canComplete = grid.canCompleteChain(
        this.longestChain.x, 
        this.longestChain.y, 
        data.dir,
        grid.nConnect - this.longestChain.length
      );
      if (data.x > -1 && canComplete) return this.makeMove(grid, data.x);
    }

    // (4)
    for (let i = 0, move; move = this.moves[i]; i++) {
      for (let i = 0; i < 5; i++) {
        const x = (i < 2)? -1: (i < 3)? 0: 1; 
        const y = (i < 1)?  0: (i < 4)? 1: 0; 
        const canComplete = grid.canCompleteChain(
          move.x,
          move.y,
          {x, y},
          grid.nConnect-1
        );
        if (canComplete) return this.makeMove(grid, x);
      }
    }

    // (5)
    for (let i = 0, player; player = players[i]; i++) {
      if (player.longestChain.length > 1) {
        const data = grid.findChainContinuingColumn(player.longestChain);
        if (data.x > -1) return this.makeMove(grid, data.x);
      }
    }

    // (6)
    return this.makeMove(grid, util.randomInt(0, grid.columns-1));
  }

};