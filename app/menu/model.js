import {hasTouch} from 'util/device';

import Settings   from 'menu/settings/model';

export default React.createClass({
  displayName: 'Menu',
  toSkipIntro: false,

  getInitialState() {
    return {
      menuState: 'intro',
      introState: ''
    };
  },

  componentDidMount() {
    setTimeout( () => document.getElementById( 'title' ).classList.add( 'active' ), 100 )
  },

  play(e) {
    this.props.onStartGame();
  },

  settings(e) {
    this.setState({
      menuState: ( this.state.menuState === 'settings' )? '': 'settings'
    });
  },

  skipIntro() {
    if ( this.toSkipIntro ) { return; }

    this.setState( { introState: 'skip-intro' } );
    this.toSkipIntro = true;
  },

  render() {
    return (
      <div  
        className = { `${ this.state.menuState } ${ this.state.introState }` } 
        onTouchEnd = { this.skipIntro }
        id='menu'>
        <div id='title'>
          Connect More
          <div 
            onTouchEnd = { this.play }
            onClick = { hasTouch? undefined: this.play } 
            id='btn-play'>I accept</div>
          <div 
            onTouchEnd = { this.settings }
            onClick = { hasTouch? undefined: this.settings } 
            id='btn-settings'>Arrangements</div>
        </div>
        <Settings 
          onSubmit = { this.settings } 
          onSettingsChange = { this.props.onSettingsChange } />
      </div>
    );
  }
});