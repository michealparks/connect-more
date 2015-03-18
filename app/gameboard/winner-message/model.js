import {subscribe, publish} from 'util/mediator';

export default React.createClass({
  displayName: 'WinnerMessage',
  sound: null,

  getInitialState() {
    return {
      className: '',
      player: ''
    };
  },

  componentWillMount() {
    subscribe('Player::win', this.playerWins);
  },

  playerWins(player) {
    this.setState({
      className: 'active',
      player: player
    });
  },

  playAgain() {
    publish('Game::restart');
    this.setState({
      className: ''
    });
  },

  goToMenu() {
    publish('Game::end');
    this.setState({
      className: ''
    });
  },

  render() {
    return (
      <div id='winner-message' className={this.state.className}>
        <div id='message'>
          The title of <span className='champion'>&ldquo;Champion&rdquo;</span> 
          is hereby awarded to the respected {this.state.player.type}, 
          <span className='name'>{this.state.player.name}</span></div>
        <div onClick={this.playAgain} id='btn-play-again'>Play again</div>
        <div onClick={this.goToMenu} id='btn-menu'>Return to menu</div>
      </div>
    );
  }
});