import {hasTouch} from 'util/device';

import GameboardTile from 'gameboard/gameboard-column/gameboard-tile/model';

export default React.createClass({
  displayName: 'GameboardColumn', 

  getInitialState() {
    return {
      hovered: this.props.hovered || -1
    };
  },

  onMouseOver() {
    const columnData = this.props.data;
    let i = columnData.length;
    while (i-- > 0) {
      if (columnData[i] == -1) {
        return this.setState({hovered: i});
      }
    }
    this.setState({hovered: -1});
  },

  onMouseLeave() {
    this.setState({hovered: -1});
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
        onMouseOver={hasTouch? null: this.onMouseOver}
        onMouseLeave={hasTouch? null: this.onMouseLeave}
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