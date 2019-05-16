import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

// Visual component showing a small histogram, initially made for
// percentiles.
export default class Histogram extends React.Component {
  scale(count) {
    const {values} = this.props;
    return `${Math.ceil(100 * count / values.length)}%`;
  }

  render() {
    const {range, values, bucketSize, height, style = {}} = this.props;
    const buckets = _.groupBy(values, value => bucketSize * Math.floor(value / bucketSize));
    const bucketValues = _.range(range[0], range[1], bucketSize);
    return (
      <div className="Histogram" style={{height, ...style}}>
        <div style={{position: 'relative', width: '100%', height}}>
          {bucketValues.map(bucketFloor => {
            const countInBucket = (buckets[bucketFloor] || []).length;
            return this.renderBucket(bucketFloor, bucketValues.length, countInBucket);
          })}
        </div>
      </div>
    );
  }


  renderBucket(bucketFloor, bucketsCount, countInBucket) {
    if (countInBucket === 0) return null;

    const {bucketSize, values, range, height, innerStyle} = this.props;
    const width = (range[1] - range[0]) / bucketsCount;
    const yScale = this.props.yScale || 1;
    const x = (range[1] - range[0]) * (bucketFloor / range[1]);
    const y = Math.ceil(height * countInBucket / values.length) / yScale;
    const title = `${bucketFloor}-${bucketFloor+bucketSize} has ${countInBucket} values, ${Math.round(100* countInBucket/values.length)}%`;
    
    return (
      <div key={bucketFloor} title={title}>
        <div style={{
          position: 'absolute',
          background: 'blue',
          left: `${x}%`,
          width: `${width}%`,
          bottom: 0,
          height: y,
          ...innerStyle
        }}>{'\u00A0'}</div>
      </div>
    );
  }
}

Histogram.propTypes = {
  bucketSize: PropTypes.number.isRequired,
  range: PropTypes.arrayOf(PropTypes.number).isRequired,
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object,
  yScale: PropTypes.number
};
