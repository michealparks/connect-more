import Settings from 'menu/settings/model';

export default React.createClass({
  displayName: 'Menu',

  getInitialState() {
    return {
      menuState: 'intro'
    };
  },

  componentDidMount() {
    setTimeout(() => document.getElementById('title').classList.add('active'), 100)
  },

  play() {
    this.props.onStartGame(this.props.sound);
  },

  settings() {
    this.setState({
      menuState: this.state.menuState == 'settings'? '': 'settings'
    });
  },

  render() {
    return (
      <div id='menu' className={this.state.menuState}>
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