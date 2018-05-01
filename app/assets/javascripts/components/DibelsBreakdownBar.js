import React from 'react';

// Visual component showing a horizontal bar broken down into three colors
// showing percent of students at different DIBELS levels.
export default function DibelsBreakdownBar(props) {
  const {height, coreCount, strategicCount, intensiveCount, style = {}} = props;
  const totalCount = coreCount + strategicCount + intensiveCount;
  const opacity = 0.5;
  const fontSize = 10;
  const scale = (value) => `${Math.round(100 * value)}%`;

  if (totalCount === 0) return null;
  return (
    <div className="DibelsBreakdownBar" style={{height, ...style}}>
      <div style={{position: 'relative', width: '100%', height}}>
        <div style={{
          position: 'absolute',
          background: 'green',
          opacity,
          fontSize,
          left: scale(0),
          width: scale(coreCount / totalCount),
          height
        }}>{'\u00A0'}</div>
        <div style={{
          position: 'absolute',
          background: 'orange',
          opacity,
          fontSize,
          left: scale(coreCount / totalCount),
          width: scale(strategicCount / totalCount),
          height
        }}>{'\u00A0'}</div>
        <div style={{
          position: 'absolute',
          background: 'red',
          opacity,
          fontSize,
          left: scale((coreCount + strategicCount) / totalCount),
          width: scale(intensiveCount / totalCount),
          height
        }}>{'\u00A0'}</div>

        {coreCount > 0 && 
          <div style={{
            position: 'absolute',
            textAlign: 'left',
            opacity,
            fontSize,
            left: scale(0),
            width: scale(coreCount / totalCount),
            top: height/2  + 1, // padding
            color: 'green'
          }}>{Math.round(100 * coreCount / totalCount)}%</div>}
      </div>
    </div>
  );
}
DibelsBreakdownBar.propTypes = {
  coreCount: React.PropTypes.number.isRequired,
  strategicCount: React.PropTypes.number.isRequired,
  intensiveCount: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  style: React.PropTypes.object
};
