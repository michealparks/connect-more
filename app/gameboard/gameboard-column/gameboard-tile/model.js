export default React.createClass({
  displayName: 'GameboardTile', 

  render() {
    return (
      <div 
        style={{
          width: `${this.props.tileSize}px`,
          height: `${this.props.tileSize}px`
        }}
        className={`${this.props.playerClass} gameboard-tile`}>
        <div
          style={{
            width: `${this.props.tileSize-14}px`, 
            height: `${this.props.tileSize-14}px`
          }}
          className={`${this.props.className} shadow`}></div>
        <div 
          style={{
            width: `${this.props.tileSize-14}px`,
            height: `${this.props.tileSize-14}px`
          }}
          className={`piece ${this.props.playerClass}`}></div>

      </div>
    );
  }
});