import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import {exportedNoteText} from './NoteText';
import ResizingTextArea from './ResizingTextArea';


// A visual component for rendering note text that also handles UX and styling
// for editing the text in-place.  The `onTextChanged` callback is called
// when on changes, but the component is uncontrolled.
//
// Relies on CSS class for hover styling when editable.
export default class EditableNoteText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.defaultText
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState.value, this.state.value)) {
      this.props.onTextChanged(this.state.value);
    }
  }

  render() {
    const {style} = this.props;
    const {value} = this.state;
    return (
      <div className="EditableNoteText">
        <ResizingTextArea
          style={{
            ...exportedNoteText,
            ...styles.textarea,
            ...style
          }}
          value={value}
          onChange={e => this.setState({value: e.target.value})} />
      </div>
    );
  }
}
EditableNoteText.propTypes = {
  defaultText: PropTypes.string.isRequired,
  onTextChanged: PropTypes.func.isRequired,
  style: PropTypes.object
};

const styles = {
  textarea: {
    borderRadius: 3,
    resize: 'none'
  }
};
