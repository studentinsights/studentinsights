import React from 'react';


// A component for tracking mouse hover state
export default class Hover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false
    };

    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
  }

  onMouseEnter(e) {
    this.setState({isHovering: true});
  }

  onMouseLeave(e) {
    this.setState({isHovering: false});
  }

  render() {
    const {children, style} = this.props;
    const {isHovering} = this.state;
    return (
      <div
        className="Hover"
        style={style}
        onMouseLeave={this.onMouseLeave}
        onMouseEnter={this.onMouseEnter}>{children(isHovering)}</div>
    );
  }
}
Hover.propTypes = {
  children: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};