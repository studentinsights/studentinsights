import React from 'react';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different DIBELS levels.
export default class DibelsBreakdownBar extends React.Component {
  totalCount() {
    const {coreCount, strategicCount, intensiveCount} = this.props;
    return coreCount + strategicCount + intensiveCount;
  }

  scale(count) {
    const totalCount = this.totalCount();
    return `${Math.ceil(100 * count / totalCount)}%`;
  }

  render() {
    const {height, coreCount, strategicCount, intensiveCount, style = {}} = this.props;    
    return (
      <div className="DibelsBreakdownBar" style={{height, ...style}}>
        <div style={{position: 'relative', width: '100%', height}}>
          {this.renderBarAndLabel({
            left: 0,
            width: coreCount,
            color: 'green'
          })}
          {this.renderBarAndLabel({
            left: coreCount,
            width: strategicCount,
            color: 'orange'
          })}
          {this.renderBarAndLabel({
            left: coreCount + strategicCount,
            width: intensiveCount,
            color: 'red'
          })}
        </div>
      </div>
    );
  }


  renderBarAndLabel({left, width, color}) {
    const {height, labelTop} = this.props;
    const opacity = 0.5;
    const fontSize = 10;

    if (width === 0) return;
    return (
      <div>
        <div style={{
          opacity,
          fontSize,
          position: 'absolute',
          background: color,
          left: this.scale(left),
          width: this.scale(width),
          height
        }}>{'\u00A0'}</div>
        {width > 0 && 
          <div style={{
            opacity,
            fontSize,
            color,
            position: 'absolute',
            textAlign: 'right',
            left: this.scale(left),
            width: this.scale(width),
            top: labelTop,
            paddingRight: 1
          }}>{width}</div>}
      </div>
    );
  }
}

DibelsBreakdownBar.propTypes = {
  coreCount: React.PropTypes.number.isRequired,
  strategicCount: React.PropTypes.number.isRequired,
  intensiveCount: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  labelTop: React.PropTypes.number.isRequired,
  style: React.PropTypes.object
};
