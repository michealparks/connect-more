import WinnerMessage    from 'gameboard/winner-message/model';
import GameboardSurface from 'gameboard/gameboard-surface/model';
import GameboardColumn  from 'gameboard/gameboard-column/model';

import {publish}        from 'util/mediator';

export default React.createClass({
  displayName: 'Gameboard',
  column: 0,

  getInitialState() {
    const width = this.props.grid.columns * this.props.tileSize;
    const height = this.props.grid.rows * this.props.tileSize;
    return {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        margin: `60px -${width/2}px`,
        left: `50%`
      },
      hovered: -1,
      playerClass: '',
    }
  },

  onTouchMove(e) {
    this.column = Math.floor( e.changedTouches[0].pageX / this.props.tileSize );
    if (this.column !== this.state.hovered) {
      this.setState({hovered: this.column});
    }
  },

  onTouchEnd(e) {
    this.props.onPlayerMove(this.column);
  },

  render() {
    const columns = this.props.grid.data.map((column, i) => {
      return <GameboardColumn 
        onPlayerMove={this.props.onPlayerMove}
        key={i}
        id={i}
        data={column}
        height={column.length} 
        hovered={this.state.hovered == i}
        tileSize={this.props.tileSize} />
    });

    return (
      <section 
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}

        style={this.state.style} 
        id='gameboard'>
        <div id='current-player' className={this.state.playerClass}>{this.props.currentPlayer? this.props.currentPlayer.name: ''}</div>
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