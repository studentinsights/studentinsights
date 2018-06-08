import React from 'react';

// Render a horizontal Bar that is filled with `color` and is a
// `percentage` of the width of the container.
export default class Bar extends React.Component {

  render() {
    const {style, innerStyle, percent, threshold} = this.props;
    const title = this.props.title || percent + '%';

    return (
      <div title={title} style={{
        color: 'black',
        cursor: 'default',
        display: 'inline-block',
        width: percent + '%',
        height: '100%',
        ...style
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          ...innerStyle
        }}>
          {percent > threshold ? `${Math.round(percent)}%` : '\u00A0' }
        </div>
      </div>
    );
  }

}

Bar.propTypes = {
  percent: React.PropTypes.number.isRequired,
  threshold: React.PropTypes.number.isRequired,
  style: React.PropTypes.object,
  innerStyle: React.PropTypes.object,
  title: React.PropTypes.string
};
