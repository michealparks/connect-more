import {hasTouch} from 'util/device';

export default React.createClass({
  displayName: 'Settings',

  getInitialState() {
    const ls  = window.localStorage;
    const nC  = ls.getItem('connectMore_numConnect')   || 4;
    const nH  = ls.getItem('connectMore_numHumans')    || 1;
    const nAI = ls.getItem('connectMore_numComputers') || 1;
    const nP  = ls.getItem('connectMore_numPlayers')   || 2;
    const ss  = ls.getItem('connectMore_soundState')   || 1;

    return {
      numConnect: nC - 0,
      numHumans: nH - 0,
      numComputers: nAI - 0,
      numPlayers: nP - 0,
      sound: Boolean(ss - 0),
    };
  },

  componentDidUpdate() {
    const ls = window.localStorage;
    ls.setItem('connectMore_numConnect', this.state.numConnect);
    ls.setItem('connectMore_numHumans', this.state.numHumans);
    ls.setItem('connectMore_numComputers', this.state.numComputers);
    ls.setItem('connectMore_numPlayers', this.state.numPlayers);

    // Bool to number to string, oh my!
    ls.setItem('connectMore_soundState', '' + (this.state.sound - 0));
  },

  changeConnect(e) {
    this.setState({
      numConnect: e.target.textContent-0
    });
  },

  changePlayerNum(e) {
    const num = e.target.textContent-0;
    const comps = this.state.numComputers;
    const humans = this.state.numHumans;

    switch (e.target.classList[1]) {
      case 'num-human-players':
        this.setState({
          numHumans: num,
          numComputers: (comps + num > 4)? (4 - num): 
            (num < 2 && comps < 1)? 1: comps
        });
        break;
      case 'num-computer-players':
        this.setState({
          numHumans: (humans + num > 4)? (4 - num): humans,
          numComputers: num
        });
        break;
      default: break;
    }
  },

  toggleSound() {
    const newState = ! this.state.sound;
    this.setState({sound: newState})
  },

  onSubmit() {
    this.props.onSettingsChange(this.state);
    this.props.onSubmit();
  },

  render() {
    return (
      <div id='settings'>
        <div>
          <div id='num-connect' className='container' data-num={this.state.numConnect}>
            <span onTouchEnd={this.changeConnect} onClick={hasTouch? null: this.changeConnect} className='option num-connect'>3</span>
            <span onTouchEnd={this.changeConnect} onClick={hasTouch? null: this.changeConnect} className='option num-connect'>4</span>
            <span onTouchEnd={this.changeConnect} onClick={hasTouch? null: this.changeConnect} className='option num-connect'>5</span>
            <span className='title'>to Connect</span>
          </div>
          <div id='num-human-players' className='container' data-num={this.state.numHumans}>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-human-players'>1</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-human-players'>2</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-human-players'>3</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-human-players'>4</span>
            <span className='title'>Human Players</span>
          </div>
          <div id='num-computer-players' className='container' data-num={this.state.numComputers}>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-computer-players'>0</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-computer-players'>1</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-computer-players'>2</span>
            <span onTouchEnd={this.changePlayerNum} onClick={hasTouch? null: this.changePlayerNum} className='option num-computer-players'>3</span>
            <span className='title'>Computer Players</span>
          </div>
        </div>
        <div id='btn-ammend' onTouchEnd={this.onSubmit} onClick={hasTouch? null: this.onSubmit}>Ammend registry</div>
        <div hidden='true' id='btn-sound-state' className={this.state.sound? 'on': 'off'}>
          <div onTouchEnd={this.toggleSound} onClick={hasTouch? null: this.toggleSound} className='sound-option'>Sound on</div>
          <div onTouchEnd={this.toggleSound} onClick={hasTouch? null: this.toggleSound} className='sound-option'>Sound off</div>
        </div>
      </div>
    );
  }
})