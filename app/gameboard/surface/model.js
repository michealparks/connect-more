import {hasTouch} from 'util/device';
import {publish}  from 'util/mediator';

export default React.createClass({
  displayName: 'GameboardSurface',

  goToMenu() {
    publish( 'Game::end' );
  },

  render() {
    const style = {
      width: `${ this.props.width * this.props.tileSize }px`
    };

    return (
      <div 
        id='gameboard-surface' 
        className = { this.props.state } 
        style= { style }>
        <div 
          onTouchEnd = { this.goToMenu } 
          onClick = { hasTouch? null: this.goToMenu } 
          id='btn-menu'>End Game</div>
        <div id='n-connect'>{ this.props.nConnect } to connect.</div>
      </div>
    );
  }
});