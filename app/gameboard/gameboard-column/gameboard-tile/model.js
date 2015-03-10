export default React.createClass({
  displayName: 'GameboardTile', 

  getInitialState() {
    return {
      style: {
        height: `${this.props.tileSize}px`, 
        width: `${this.props.tileSize}px`
      }
    };
  },

  render() {
    return (
      <div 
        style={this.state.style}
        className={`${this.props.playerClass} gameboard-tile`}>
        <div
          style={{
            width: `${this.props.tileSize-10}px`, 
            height: `${this.props.tileSize-10}px`
          }}
          className='shadow'></div>
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