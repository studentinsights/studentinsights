// Render a horizontal Bar that is filled with `color` and is a
// `percentage` of the width of the container.
export default React.createClass({
  displayName: 'Bar',

  propTypes: {
    color: React.PropTypes.string.isRequired,
    percent: React.PropTypes.number.isRequired,
    threshold: React.PropTypes.string.isRequired
  },

  render() {
    const {color, percent, threshold} = this.props;

    return (
      <div style={{
        backgroundColor: color,
        display: 'inline-block',
        width: percent + '%',
        height: '100%'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          height: '100%'
        }}>
          {percent > threshold ? Math.round(percent) : '.'}
        </div>
      </div>
    );
  }
});