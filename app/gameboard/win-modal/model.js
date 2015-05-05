import {hasTouch} from 'util/device';          
import {publish}  from 'util/mediator';

export default React.createClass({
  displayName: 'WinnerMessage',
  
  playAgain() {
    publish( 'Game::restart' );
    this.setState({ className: '', player: '' });
  },

  goToMenu() {
    publish( 'Game::end' );
    this.setState({ 
      className: '', 
      player: ''
    });
  },

  render() {
    if ( ! this.props.winningPlayer ) { return <div></div> };

    const className = ( this.props.winningPlayer )? 'active': '';
    const player = this.props.winningPlayer || {};

    return (
      <div id='winner-message' className = { className }>
        <div id='message'>
          The title of <span className='champion'>&ldquo;Champion&rdquo;</span> 
          is hereby awarded to the respected { player.type }, 
          <span className='name'>{ player.name }</span></div>
        <div 
          onTouchEnd = { this.playAgain } 
          onClick = { hasTouch? undefined: this.playAgain } 
          id='btn-play-again'>Play again</div>
        <div 
          onTouchEnd = { this.goToMenu } 
          onClick = { hasTouch? undefined: this.goToMenu } 
          id='btn-menu'>Return to menu</div>
      </div>
    );
  }
});