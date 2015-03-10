export default React.createClass({
  displayName: 'Settings',

  getInitialState() {
    return {
      numConnect: 4,
      numHumans: 1,
      numComputers: 1,
      numPlayers: 2
    };
  },

  componentDidUpdate() {
    this.props.onSettingsChange(this.state);
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

    switch (e.target.className) {
      case 'num-human-players':
        this.setState({
          numHumans: num,
          numComputers: (comps > 2 && num > 2)? 
            Math.abs(comps - 4): (num < 2 && comps < 1)? 1 :comps
        });
        break;
      case 'num-computer-players':
        this.setState({
          numHumans: (humans > 2 && num > 2)?
            1: (num < 1)? 2: humans,
          numComputers: num
        });
        break;
      default: break;
    }
  },

  render() {
    return (
      <div id='settings'>
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
    );
  }
})