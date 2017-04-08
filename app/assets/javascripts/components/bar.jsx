// Render a horizontal Bar that is filled with `color` and is a
// `percentage` of the width of the container.
export default React.createClass({
  displayName: 'Bar',

  propTypes: {
    color: React.PropTypes.string.isRequired,
    percent: React.PropTypes.number.isRequired,
    threshold: React.PropTypes.number.isRequired,
    title: React.PropTypes.string
  },

  render() {
    const {color, percent, threshold} = this.props;
    const title = this.props.title || percent + '%';

    return (
      <div title={title} style={{
        backgroundColor: color,
        cursor: 'default',
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