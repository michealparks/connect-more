import GLOBAL      from 'util/global';
import {subscribe} from 'util/mediator'

import Player      from 'player/model';
import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model';
import Sound       from 'sound/model';

class GameController {
  constructor(config) {
    window.addEventListener('resize', () => {
      this.tileSize = window.innerWidth/this.grid.columns;
      if (this.tileSize > 100) this.tileSize = 100;
      this.update();
    });
  }

  newGame(config) {
    this.grid = new Grid(config.grid);
    this.tileSize = window.innerWidth/this.grid.columns;
    this.canMove = true;
    this.hasEnded = false;
    this.winningPlayer = false;
    this.players = config.players.map((config) => new Player(config));
    this.player = this.players[0];

    if (this.tileSize > 100) this.tileSize = 100;

    Sound.play('gameBackground');
    this.update();
  }

  onWin() {
    this.hasEnded = true;
    if (this.winningPlayer.type == 'computer') {
      Sound.play('loseBackground');
    } else {
      Sound.play('winBackground');
    }
  }

  onPlayerMove(column) {
    if (! this.canMove || this.hasEnded) return;

    Sound.playHitEffect();
    this.winningPlayer = this.player
      .beginMove()
      .makeMove(this.grid, column)
      .endMove(this.grid);

    this.update();

    if (this.winningPlayer) return this.onWin();

    this.nextPlayer();
    this.update();

    if (this.player.type == 'computer') {
      this.canMove = false;
      window.setTimeout(this.onComputerMove.bind(this), 1000);
    }
  }

  onComputerMove() {
    Sound.playHitEffect();
    this.winningPlayer = this.player
      .beginMove()
      .decideMove(this.grid, this.players)
      .endMove(this.grid);
    this.update();

    if (this.winningPlayer) return this.onWin();

    this.nextPlayer();
    this.update();
    
    if (this.player.type == 'computer') {
      window.setTimeout(this.onComputerMove.bind(this), 1000);
    } else {
      this.canMove = true;
    }
  }

  nextPlayer() {
    this.player = this.player.index == this.players.length - 1?
      this.players[0] : this.players[this.player.index + 1];
    return this.player;
  }

  update() {
    React.render(
      <Gameboard 
        currentPlayer={this.player}
        winningPlayer={this.winningPlayer}
        onPlayerMove={this.onPlayerMove.bind(this)}
        grid={this.grid} 
        tileSize={this.tileSize} />,
      document.querySelector('#gameboard-container')
    );
  }
}

export default new GameController();