import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


// Listen for escape key being pressed and call `onEscape`
export default class EscapeListener extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown(e) {
    const {onEscape} = this.props;
    if (e.which === 27) onEscape();
  }

  onClick(e) {
    const {escapeOnUnhandledClick, onEscape} = this.props;
    if (escapeOnUnhandledClick) onEscape();
  }

  render() {
    const {className, children, style, escapeOnUnhandledClick} = this.props;
    const classNameString = _.compact([className, 'EscapeListener']).join(' ');
    return (
      <div
        className={classNameString}
        style={style}
        onKeyDown={this.onKeyDown}
        onClick={escapeOnUnhandledClick && this.onClick}>{children}</div>
    );
  }
}
EscapeListener.propTypes = {
  onEscape: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  escapeOnUnhandledClick: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object
};

