import WinnerMessage    from 'gameboard/winner-message/model';
import GameboardSurface from 'gameboard/gameboard-surface/model';
import GameboardColumn  from 'gameboard/gameboard-column/model';

import {publish}        from 'util/mediator';

export default React.createClass({
  displayName: 'Gameboard',
  column: 0,

  getInitialState() {
    return {
      hovered: -1,
    }
  },

  onTouchMove(e) {
    this.column = Math.floor( e.changedTouches[0].pageX / this.props.tileSize );
    if (this.column !== this.state.hovered) {
      this.setState({ hovered: this.column });
    }
  },

  onTouchEnd(e) {
    this.column = Math.floor( e.changedTouches[0].pageX / this.props.tileSize );
    this.setState({ hovered: -1 });
    this.props.onPlayerMove( this.column );
  },

  render() {
    const width = this.props.grid.columns * this.props.tileSize;
    const height = this.props.grid.rows * this.props.tileSize;
    const style = { 
      width: `${width}px`, 
      height: `${height}px`, 
      margin: `60px -${width / 2}px`
    };

    const columns = this.props.grid.data.map((column, i) =>
      <GameboardColumn 
        onPlayerMove={this.props.onPlayerMove}
        key={i}
        id={i}
        data={column}
        height={column.length} 
        hovered={this.state.hovered == i}
        tileSize={this.props.tileSize} />
    );

    return (
      <section
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}

        style={style}
        id='gameboard'>
        <div
          id='current-player'
          className={`player-${this.props.currentPlayer? this.props.currentPlayer.index + 1: 0}`}>
            <div>Player 1</div>
            <div>Player 2</div>
            <div>Player 3</div>
            <div>Player 4</div>
        </div>
        {columns}
        <GameboardSurface
          nConnect={this.props.grid.nConnect}
          width={this.props.grid.columns}
          tileSize={this.props.tileSize} />
        <WinnerMessage
          winningPlayer={this.props.winningPlayer} />
      </section>
    );
  }
});