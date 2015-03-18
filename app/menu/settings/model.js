export default React.createClass({
  displayName: 'Settings',

  getInitialState() {
    const ls  = window.localStorage;
    const nC  = ls.getItem('connectMore_numConnect')   || 4;
    const nH  = ls.getItem('connectMore_numHumans')    || 1;
    const nAI = ls.getItem('connectMore_numComputers') || 1;
    const nP  = ls.getItem('connectMore_numPlayers')   || 2;

    return {
      numConnect: nC - 0,
      numHumans: nH - 0,
      numComputers: nAI - 0,
      numPlayers: nP - 0
    };
  },

  componentDidUpdate() {
    const ls = window.localStorage;
    ls.setItem('connectMore_numConnect', this.state.numConnect);
    ls.setItem('connectMore_numHumans', this.state.numHumans);
    ls.setItem('connectMore_numComputers', this.state.numComputers);
    ls.setItem('connectMore_numPlayers', this.state.numPlayers);
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

  onSubmit() {
    this.props.onSettingsChange(this.state);
    this.props.onSubmit();
  },

  render() {
    return (
      <div id='settings'>
        <div>
          <div id='num-connect' className='container' data-num={this.state.numConnect}>
            <span onClick={this.changeConnect} className='option num-connect'>3</span>
            <span onClick={this.changeConnect} className='option num-connect'>4</span>
            <span onClick={this.changeConnect} className='option num-connect'>5</span>
            <span className='title'>to Connect</span>
          </div>
          <div id='num-human-players' className='container' data-num={this.state.numHumans}>
            <span onClick={this.changePlayerNum} className='option num-human-players'>1</span>
            <span onClick={this.changePlayerNum} className='option num-human-players'>2</span>
            <span onClick={this.changePlayerNum} className='option num-human-players'>3</span>
            <span onClick={this.changePlayerNum} className='option num-human-players'>4</span>
            <span className='title'>Human Players</span>
          </div>
          <div id='num-computer-players' className='container' data-num={this.state.numComputers}>
            <span onClick={this.changePlayerNum} className='option num-computer-players'>0</span>
            <span onClick={this.changePlayerNum} className='option num-computer-players'>1</span>
            <span onClick={this.changePlayerNum} className='option num-computer-players'>2</span>
            <span onClick={this.changePlayerNum} className='option num-computer-players'>3</span>
            <span className='title'>Computer Players</span>
          </div>
        </div>
        <div id='btn-ammend' onClick={this.onSubmit}>Ammend registry</div>
      </div>
    );
  }
})