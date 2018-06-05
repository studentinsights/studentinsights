import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  textarea: {
    marginTop: 20,
    fontSize: 14,
    border: '4px solid rgba(153,117,185, 0.4)',
    width: '100%'
  }
};

class TransitionNoteTextbox extends React.Component {

  render() {
    const {value, onChange, readOnly} = this.props;

    return (
      <textarea
        rows={10}
        style={styles.textarea}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    );
  }

}

TransitionNoteTextbox.propTypes = {
  readOnly: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TransitionNoteTextbox;

