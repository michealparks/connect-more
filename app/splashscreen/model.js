import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model';
import Player      from 'player/model';

import {subscribe} from 'util/mediator';

export default React.createClass({
  displayName: 'Splashscreen',
  timeoutId: null,
  players: [],
  player: null,

  getInitialState() {
    const grid = new Grid({rows: 10});
    return {
      grid: grid,
      tileSize: window.innerWidth/grid.columns
    };
  },

  componentDidMount() {
    let onResize = () => {
      this.setState({
        grid: this.state.grid,
        tileSize: window.innerWidth/this.state.grid.columns
      });
    };

    this.players = [0, 1, 2, 3].map((i) => new Player({ index: i })); 
    this.player = this.players[0];

    window.addEventListener('resize', () => {
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null
      }
      this.timeoutId = window.setTimeout(onResize, 400);
    });

    window.setTimeout(this.addRandomPiece, 100);
  },

  addRandomPiece() {
    this.player
      .beginMove()
      .decideMove(this.state.grid, this.players)
      .endMove(this.state.grid);
    this.setState({ grid: this.state.grid });
    this.nextPlayer();

    if (this.state.grid.isFilled()) return;


    window.setTimeout(this.addRandomPiece, 100);
  },

  nextPlayer() {
    this.player = this.player.index == this.players.length - 1?
      this.players[0] : this.players[this.player.index + 1];
    return this.player;
  },

  render() {
    return (
      <div id='splashscreen'>
        <Gameboard grid={this.state.grid} tileSize={this.state.tileSize} />
      </div>
    );
  }
})