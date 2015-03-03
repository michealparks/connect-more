export default React.createClass({
  displayName: 'Menu',

  render() {
    return (
      <div id='menu'>
        <div id='title'>Connect More</div>
        <div id='btn-resume' className={this.props.state}>
          {this.props.state}
        </div>
        <div id='btn-settings' className='icon-gear'></div>
      </div>
    );
  }
});