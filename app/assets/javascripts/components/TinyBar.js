import React from 'react';

// Render a horizontal Stack that is filled in order, with each bar
// having a {`color`, `count`} and an overall `scaleFn`.
export default class Stack extends React.Component {

  render() {
    const {style, barStyle, labelStyle, stacks, scaleFn, labelFn} = this.props;

    return (
      <div style={{
        color: 'black',
        cursor: 'default',
        display: 'inline-block',
        position: 'relative',
        width: '100%',
        height: '100%',
        ...style
      }}>
        {stacks.map((stack, index) => {
          const sum = stacks.slice(0, index).reduce((count, stack) => count + stack.count, 0);
          const {key, color, count} = stack;
          const label = labelFn(count, stack, index);
          function toScreen(count) {
            return `${Math.round(100*scaleFn(count))}%`;
          }
          return (
            <div
              key={key === undefined ? index : key}
              style={{width: '100%'}}>
              <div style={{
                position: 'absolute',
                left: toScreen(sum),
                backgroundColor: color,
                width: toScreen(count),
                height: '100%',
                ...barStyle
              }} />
              <div style={{
                position: 'absolute',
                left: toScreen(sum),
                width: toScreen(count),
                height: '100%',
                ...labelStyle
              }}>{label}</div>
            </div>
          );
        })}
      </div>
    );
  }

}

Stack.propTypes = {
  stacks: React.PropTypes.array.isRequired,
  scaleFn: React.PropTypes.func.isRequired,
  labelFn: React.PropTypes.func.isRequired,
  style: React.PropTypes.object,
  barStyle: React.PropTypes.object,
  labelStyle: React.PropTypes.object,
  title: React.PropTypes.string
};
