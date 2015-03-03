import GLOBAL      from 'util/global';
import {subscribe} from 'util/mediator'

import Player      from 'player/model';
import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model';

export default class GameController {
  constructor(config) {
    this.grid = new Grid(config.grid);
    this.tileSize = window.innerWidth/this.grid.columns;
    this.players = config.players.map((config, i) => { 
      config.index = i;
      return new Player(config); 
    });
    this.player = this.players[0];

    subscribe('Column::ptrup', this.onPlayerMove.bind(this));

    this.update();
  }

  onPlayerMove(column) {
    this.player
      .beginMove()
      .makeMove(this.grid, column)
      .endMove(this.grid);

    this.update();

    for (let i = 0; this.nextPlayer().type == 'AI'; i++) {
      this.player
        .beginMove()
        .decideMove(this.grid, this.players)
        .endMove(this.grid);

      this.update();
    }
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