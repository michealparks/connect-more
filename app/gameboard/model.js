import GameboardSurface from 'gameboard/gameboard-surface/model';
import GameboardColumn  from 'gameboard/gameboard-column/model';

export default React.createClass({
  displayName: 'Gameboard',

  getInitialState() {
    return {
      style: {
        width: `${this.props.grid.columns * this.props.tileSize}px`,
        height: `${this.props.grid.rows * this.props.tileSize}px`
      }
    }
  },

  render() {
    const columns = this.props.grid.data.map((column, i) =>
      <GameboardColumn 
        key={i}
        id={i}
        data={column}
        height={column.length} 
        tileSize={this.props.tileSize} />
    );

    return (
      <section style={this.state.style} id='gameboard'>
        {columns}
        <GameboardSurface 
          width={this.props.grid.columns}
          tileSize={this.props.tileSize} />
      </section>
    );
  }
});