import GLOBAL      from 'util/global';
import {subscribe} from 'util/mediator'

import Player      from 'player/model';
import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model';

export default class GameController {
  constructor(config, sound) {
    this.grid = new Grid(config.grid);
    this.tileSize = window.innerWidth/this.grid.columns;
    this.sound = sound;

    if (this.tileSize > 100) this.tileSize = 100;

    this.players = config.players.map((config) => new Player(config));
    this.player = this.players[0];

    subscribe('Column::ptrup', this.onPlayerMove.bind(this));

    this.sound.play('gameBackground');
    this.update();

    window.addEventListener('resize', () => {
      this.tileSize = window.innerWidth/this.grid.columns;
      if (this.tileSize > 100) this.tileSize = 100;
      this.update();
    });
  }

  onPlayerMove(column) {
    this.sound
      .playHitEffect();
    this.player
      .beginMove()
      .makeMove(this.grid, column)
      .endMove(this.grid);

    this.update();

    let computerMove = () => {
      if (this.nextPlayer().type == 'AI') {
        this.sound
          .playHitEffect();
        this.player
          .beginMove()
          .decideMove(this.grid, this.players)
          .endMove(this.grid);

        this.update();

        window.setTimeout(computerMove, 1000);
      }
    }

    window.setTimeout(computerMove, 1000);
  }

  nextPlayer() {
    this.player = this.player.index == this.players.length - 1?
      this.players[0] : this.players[this.player.index + 1];
    return this.player;
  }

  update() {
    React.render(
      <Gameboard grid={this.grid} tileSize={this.tileSize} />,
      document.querySelector('#gameboard-container')
    );
  }
}