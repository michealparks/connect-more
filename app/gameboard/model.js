import GameboardSurface from 'gameboard/gameboard-surface/model';
import GameboardColumn  from 'gameboard/gameboard-column/model';

export default React.createClass({
  displayName: 'Gameboard',

  getInitialState() {
    const width = this.props.grid.columns * this.props.tileSize;
    const height = this.props.grid.rows * this.props.tileSize;
    return {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        margin: `0 -${width/2}px`,
        left: `50%`
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