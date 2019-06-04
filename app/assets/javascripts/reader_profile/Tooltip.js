import React from 'react';


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
    this.timer = window.setTimeout(this.onTimedTriggered, 500);
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
    const {title, style, children} = this.props;
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
            left: 20,
            top: 20,
            border: '1px solid #ccc',
            zIndex: 10 // above other siblings
          }}>{title}</div>
        }
      </div>
    );
  }
}