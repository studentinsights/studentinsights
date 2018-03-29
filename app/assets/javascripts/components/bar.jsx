import React from 'react';

// Render a horizontal Bar that is filled with `color` and is a
// `percentage` of the width of the container.
export default React.createClass({
  displayName: 'Bar',

  propTypes: {
    percent: React.PropTypes.number.isRequired,
    threshold: React.PropTypes.number.isRequired,
    styles: React.PropTypes.object,
    innerStyles: React.PropTypes.object,
    title: React.PropTypes.string
  },

  render() {
    const {styles, innerStyles, percent, threshold} = this.props;
    const title = this.props.title || percent + '%';

    return (
      <div title={title} style={{
        ...styles,
        color: 'black',
        cursor: 'default',
        display: 'inline-block',
        width: percent + '%',
        height: '100%'
      }}>
        <div style={{
          ...innerStyles,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          {percent > threshold ? Math.round(percent) : '\u00A0' }
        </div>
      </div>
    );
  }
});