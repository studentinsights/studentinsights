import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


// Listen for escape key being pressed and call `onEscape`
export default class EscapeListener extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onKeyUp(e) {
    const {onEscape} = this.props;
    if (e.which === 27) onEscape();
  }

  render() {
    const {className, children, style} = this.props;
    const classNameString = _.compact([className, 'EscapeListener']).join(' ');
    return <div className={classNameString} style={style} onKeyUp={this.onKeyUp}>{children}</div>;
  }
}
EscapeListener.propTypes = {
  onEscape: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object
};

