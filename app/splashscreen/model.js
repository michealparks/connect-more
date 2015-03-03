import Gameboard   from 'gameboard/model';
import Grid        from 'grid/model'

import {subscribe} from 'util/mediator';

export default React.createClass({
  displayName: 'Splashscreen',
  timeoutId: null,

  getInitialState() {
    const grid = new Grid;
    return {
      grid: grid,
      tileSize: window.innerWidth/grid.columns
    };
  },

  componentDidMount() {
    let onResize = () => {
      this.setState({
        grid: this.state.grid,
        tileSize: window.innerWidth/this.state.grid.columns
      });
    };

    window.addEventListener('resize', () => {
      if (this.timeoutId) {
        window.clearTimeout(this.timeoutId);
        this.timeoutId = null
      }
      this.timeoutId = window.setTimeout(onResize, 400);
    });
  },

  render() {
    return (
      <Gameboard grid={this.state.grid} tileSize={this.state.tileSize} />
    );
  }
})