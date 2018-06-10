import PropTypes from 'prop-types';
import React from 'react';
import percentile from 'percentile';


function percentiles(values) {
  return [
    percentile(0, values),
    percentile(25, values),
    percentile(50, values),
    percentile(75, values),
    percentile(100, values)
  ];
}


export default function BoxAndWhisker({values, boxStyle, whiskerStyle, labelStyle, style}) {
  const [min, p25, p50, p75, max] = percentiles(values);
  const labelWidth = 50; // arbitrary

  const scale = (value) => `${value}%`;
  const [height, midTop, barHeight] = [18, 5, 7];
  return (
    <div className="BoxAndWhisker" style={{height, ...style}}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}>
        <div style={{
          position: 'absolute',
          backgroundColor: '#999',
          height: 1,
          top: midTop,
          left: scale(min),
          width: scale(max - min),
          ...whiskerStyle}}>{'\u00A0'}</div>
        <div style={{
          position: 'absolute',
          background: '#ccc',
          border: '1px solid #999',
          borderRight: 0,
          fontSize: 10,
          paddingLeft: 3,
          left: scale(p25),
          width: scale(p50 - p25),
          top: midTop-barHeight/2,
          height: barHeight,
          ...boxStyle}}>{'\u00A0'}</div>
        <div style={{
          position: 'absolute',
          background: '#ccc',
          border: '1px solid #999',
          fontSize: 10,
          paddingLeft: 3,
          left: scale(p50),
          width: scale(p75 - p50),
          top: midTop-barHeight/2,
          height: barHeight,
          ...boxStyle}}>{'\u00A0'}</div>
        <div style={{
          position: 'absolute',
          left: scale(p50 - labelWidth/2),
          width: scale(labelWidth),
          textAlign: 'center',
          fontSize: 10,
          top: midTop+barHeight/2,
          color: '#333',
          ...labelStyle}}>{p50}</div>
      </div>
    </div>
  );
}
BoxAndWhisker.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  style: PropTypes.object,
  boxStyle: PropTypes.object,
  whiskerStyle: PropTypes.object,
  labelStyle: PropTypes.object
};
