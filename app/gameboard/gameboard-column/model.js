import GameboardTile from 'gameboard/gameboard-column/gameboard-tile/model';

import {publish}     from 'util/mediator';

export default React.createClass({
  displayName: 'GameboardColumn', 

  getInitialState() {
    return {
      hovered: this.props.hovered || -1
    };
  },

  onMouseOver() {
    if (window.ontouchstart === undefined) {
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
    if (window.ontouchstart === undefined) return;
    
    this.setState({hovered: -1});
  },

  onMouseUp(e) {
    if (window.ontouchstart !== undefined) return;
    if (this.props.data.indexOf(-1) == -1) return;

    publish('Column::ptrup', parseInt(e.currentTarget.id, 10));
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
        onTouchMove={this.onMouseOver}
        onMouseOver={this.onMouseOver}
        onTouchStart={this.onMouseOver}
        onMouseLeave={this.onMouseLeave}
        onMouseUp={this.onMouseUp}
        id={this.props.id}
        style={{
          height: `${this.props.tileSize * this.props.height}px`, 
          width: `${this.props.tileSize}px`
        }}
        className={`gameboard-column`} >
        {tiles}
      </div>
    );
  }
});