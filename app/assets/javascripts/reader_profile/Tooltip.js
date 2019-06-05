import React from 'react';
import PropTypes from 'prop-types';


// Full components as tooltips
export default class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false
    };

    this.timer = null;
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onTimedTriggered = this.onTimedTriggered.bind(this);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer() {
    if (this.timer) window.clearTimeout(this.timer);
  }

  onMouseEnter(e) {
    const {delayMs} = this.props;
    this.timer = window.setTimeout(this.onTimedTriggered, delayMs);
  }

  onMouseLeave(e) {
    this.clearTimer();
    this.setState({isVisible: false});
  }

  onTimedTriggered(e) {
    this.clearTimer();
    this.setState({isVisible: true});
  }

  render() {
    const {title, style, children, tooltipStyle} = this.props;
    const {isVisible} = this.state;
    return (
      <div
        className="Tooltip"
        style={{position: 'relative', display: 'flex', flex: 1, ...style}}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {children}
        {isVisible && <div
          style={{
            position: 'absolute',
            padding: 10,
            minWidth: 200,
            minHeight: 100,
            background: 'lightyellow',
            left: '90%',
            top: '10%',
            border: '1px solid #ccc',
            zIndex: 10, // above other siblings
            ...tooltipStyle
          }}>{title}</div>
        }
      </div>
    );
  }
}
Tooltip.propTypes = {
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  delayMs: PropTypes.number,
  style: PropTypes.object,
  tooltipStyle: PropTypes.object
};
Tooltip.defaultProps = {
  delayMs: 500
};
