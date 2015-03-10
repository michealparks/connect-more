import GameboardTile from 'gameboard/gameboard-column/gameboard-tile/model';

import {publish}     from 'util/mediator';

export default React.createClass({
  displayName: 'GameboardColumn', 

  getInitialState() {
    return {
      style: {
        height: `${this.props.tileSize * this.props.height}px`, 
        width: `${this.props.tileSize}px`
      }
    };
  },

  onPtrUp(e) {
    if (this.props.data.indexOf(-1) == -1) return;
    publish('Column::ptrup', parseInt(e.currentTarget.id, 10));
  },

  render() {
    const tiles = this.props.data.map((tile, i) => 
      <GameboardTile 
        key={i}
        tileSize={this.props.tileSize}
        playerClass={tile > -1? `p-${tile}`: ''} />
    );

    return (
      <div 
        onMouseUp={this.onPtrUp}
        onTouchEnd={this.onPtrUp}
        id={this.props.id}
        style={this.state.style}
        className={'gameboard-column'} >
        {tiles}
      </div>
    );
  }
});