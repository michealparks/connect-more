export default React.createClass({
  displayName: 'GameboardSurface',

  render() {
    return (
      <div 
        id='gameboard-surface' 
        className={this.props.state} 
        style={{width: `${this.props.width * this.props.tileSize}px`}}></div>
    );
  }
});