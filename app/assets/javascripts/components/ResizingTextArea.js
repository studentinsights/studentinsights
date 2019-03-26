import PropTypes from 'prop-types';
import React from 'react';


// For using <textarea /> but resizing the element as the user types
// so it shows all the text.
export default class ResizingTextArea extends React.Component {
  componentDidMount() {
    if (this.el) {
      this.el.style['overflow-y'] = 'hidden';
    }
    this.resize();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.value !== prevProps.value) {
      this.resize();
    }
  }

  resize() {
    if (this.el) {
      this.el.style.height = (this.el.scrollHeight) + 'px;';
      this.el.style.height = 'auto';
      this.el.style.height = (this.el.scrollHeight) + 'px';
    }
  }

  render() {
    return (
      <textarea
        className="ResizingTextArea"
        ref={el => this.el = el}
        {...this.props}
      />
    );
  }
}
ResizingTextArea.propTypes = {
  value: PropTypes.string
};