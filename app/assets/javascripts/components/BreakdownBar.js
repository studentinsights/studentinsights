import PropTypes from 'prop-types';
import React from 'react';

// Visual component showing a horizontal bar broken down into a few colors
// showing percent of students of different attributes (eg, DIBELS scores, gender identity).
export default class BreakdownBar extends React.Component {
  totalCount() {
    const {items} = this.props;
    return items.reduce((sum, item) => sum + item.width, 0);
  }

  scale(count) {
    const totalCount = this.totalCount();
    return `${Math.ceil(100 * count / totalCount)}%`;
  }

  render() {
    const {items,height, style = {}} = this.props;    
    return (
      <div className="BreakdownBar" style={{height, ...style}}>
        <div style={{position: 'relative', width: '100%', height}}>
          {items.map(item => this.renderBarAndLabel(item))}
        </div>
      </div>
    );
  }


  renderBarAndLabel(item) {
    const {labelFn, height, labelTop, innerStyle} = this.props;
    const {key, left, width, color} = item;

    if (width === 0) return;
    return (
      <div key={key}>
        <div style={{
          position: 'absolute',
          background: color,
          left: this.scale(left),
          width: this.scale(width),
          height,
          ...innerStyle
        }}>{'\u00A0'}</div>
        {width > 0 && 
          <div style={{
            color,
            position: 'absolute',
            textAlign: 'right',
            left: this.scale(left),
            width: this.scale(width),
            top: labelTop,
            paddingRight: 1,
            ...innerStyle
          }}>{labelFn ? labelFn(item) : width}</div>}
      </div>
    );
  }
}

BreakdownBar.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    left: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired
  })).isRequired,
  height: PropTypes.number.isRequired,
  labelTop: PropTypes.number.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
  labelFn: PropTypes.func
};
