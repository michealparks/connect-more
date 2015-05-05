export default React.createClass({
  displayName: 'GameboardTile', 

  render() {
    const tileStyle = {
      width  : `${ this.props.tileSize }px`,
      height : `${ this.props.tileSize }px`
    };

    const innerStyle = {
      width  : `${ this.props.tileSize-14 }px`, 
      height : `${ this.props.tileSize-14 }px`
    }

    return (
      <div 
        style = { tileStyle }
        className = { `${ this.props.playerClass } gameboard-tile` }>
        <div
          style={ innerStyle }
          className={ `${ this.props.className } shadow` }></div>
        <div 
          style={ innerStyle }
          className = { `piece ${ this.props.playerClass }` }></div>
      </div>
    );
  }
});