import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model';
import Player      from 'player/model';

import {subscribe} from 'util/mediator';

export default React.createClass({
  displayName: 'Splashscreen',
  resizeId: null,
  addPieceId: null,
  players: [],
  player: null,

  getInitialState() {
    const grid = new Grid({rows: 16, nConnect: 99});
    return {
      grid,
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

    window.addEventListener('resize', () => {
      this.resizeId && window.clearTimeout(this.resizeId);
      this.resizeId = window.setTimeout(onResize, 400);
    });

    this.initFauxGame();
    this.addPieceId = window.setTimeout(this.addRandomPiece, 100);
  },

  initFauxGame() {
    this.players = [0, 1, 2, 3].map((i) => new Player({ index: i })); 
    this.player = this.players[0];
  },

  addRandomPiece() {
    this.player
      .beginMove()
      .decideMove(this.state.grid, this.players)
      .endMove(this.state.grid);
    this.setState({ grid: this.state.grid });
    this.nextPlayer();

    if (this.state.grid.isFilled() || 
      document.body.classList.contains('in-game')) return;

    this.addPieceId = window.setTimeout(this.addRandomPiece, 100);
  },

  nextPlayer() {
    this.player = this.player.index == this.players.length - 1?
      this.players[0] : this.players[this.player.index + 1];
    return this.player;
  },

  render() {
    return (
      <div id='splashscreen' className={this.props.state}>
        <Gameboard grid={this.state.grid} tileSize={this.state.tileSize} />
      </div>
    );
  }
})