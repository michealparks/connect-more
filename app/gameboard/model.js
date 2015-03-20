import WinnerMessage    from 'gameboard/winner-message/model';
import GameboardSurface from 'gameboard/gameboard-surface/model';
import GameboardColumn  from 'gameboard/gameboard-column/model';

import {publish}        from 'util/mediator';

export default React.createClass({
  displayName: 'Gameboard',

  getInitialState() {
    const width = this.props.grid.columns * this.props.tileSize;
    const height = this.props.grid.rows * this.props.tileSize;
    return {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        margin: `0 -${width/2}px`,
        left: `50%`
      },
      hovered: -1
    }
  },

  onTouchMove(e) {
    let target = e.target;
    while (target.className !== 'gameboard-column') {
      target = target.parentNode;
      if (target == null) return;
    }
  },

  onTouchEnd(e) {
    let target = e.target;
    while (target.className !== 'gameboard-column') {
      target = target.parentNode;
      if (target == null) return;
    }

    const id = parseInt(target.id, 10);

    if (this.props.grid.data[id].indexOf(-1) == -1) return;

    this.props.onPlayerMove(parseInt(id, 10))
  },

  render() {
    const columns = this.props.grid.data.map((column, i) =>
      <GameboardColumn 
        onPlayerMove={this.props.onPlayerMove}
        key={i}
        id={i}
        data={column}
        height={column.length} 
        tileSize={this.props.tileSize} />
    );

    return (
      <section 
        style={this.state.style} 
        id='gameboard'
        onTouchMove={this.onTouchMove}
        onTouchEnd={this.onTouchEnd}>
        {columns}
        <GameboardSurface 
          width={this.props.grid.columns}
          tileSize={this.props.tileSize} />
        <WinnerMessage winningPlayer={this.props.winningPlayer} />
      </section>
    );
  }
});