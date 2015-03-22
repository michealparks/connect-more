import Settings from 'menu/settings/model';

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
    setTimeout(() => document.getElementById('title').classList.add('active'), 100)
  },

  play() {
    this.props.onStartGame();
  },

  settings() {
    this.setState({
      menuState: this.state.menuState == 'settings'? '': 'settings'
    });
  },

  skipIntro() {
    if (! this.toSkipIntro) {
      this.setState({
        introState: 'skip-intro'
      });
      this.toSkipIntro = true;
    }
  },

  render() {
    return (
      <div 
        id='menu' 
        className={`${this.state.menuState} ${this.state.introState}`} 
        onTouchEnd={this.skipIntro}>
        <div id='title'>
          Connect More
          <div onClick={this.play} id='btn-play'>I accept</div>
          <div onClick={this.settings} id='btn-settings'>Arrangements</div>
        </div>
        <Settings onSubmit={this.settings} onSettingsChange={this.props.onSettingsChange} />
      </div>
    );
  }
});