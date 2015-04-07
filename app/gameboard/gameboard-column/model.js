import {hasTouch} from 'util/device';

import GameboardTile from 'gameboard/gameboard-column/gameboard-tile/model';

export default React.createClass({
  displayName: 'GameboardColumn', 

  getInitialState() {
    return {
      hovered: this.props.hovered || -1
    };
  },

  onMouseUp(e) {
    if (this.props.data.indexOf(-1) == -1) return;

    this.props.onPlayerMove(parseInt(e.currentTarget.id, 10))
  },

  render() {
    const tiles = this.props.data.map((tile, i) => 
      <GameboardTile 
        key={i}
        className={this.state.hovered == i? 'hovered': ''}
        tileSize={this.props.tileSize}
        playerClass={tile > -1? `p-${tile}`: ''} />
    );

    return (
      <div 
        onMouseUp={hasTouch? null: this.onMouseUp}
        id={this.props.id}
        style={{
          'height': `${this.props.tileSize * this.props.height}px`, 
          'width': `${this.props.tileSize}px`
        }}
        className={`gameboard-column ${this.props.hovered? 'hovered': ''}`} >
        {tiles}
      </div>
    );
  }
});