import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import {modalFullScreenFlex} from '../components/HelpBubble';


export default class TransitionNoteDialog extends React.Component {
  render() {
    const {isWritingTransitionNote, onWritingTransitionNoteChanged} = this.props;
    return (
      <ReactModal
        isOpen={isWritingTransitionNote}
        style={modalFullScreenFlex}
        onRequestClose={e => {
          e.preventDefault();
          e.stopPropagation();
          onWritingTransitionNoteChanged(false);
        }}
      >
        <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
          <h1>Transition note</h1>
          <div style={{display: 'flex', flex: 1}}>
            <div style={{flex: 1}}>normal</div>
            <div style={{flex: 1}}>restricted</div>
          </div>
          <div>
            <button className="btn save">Save</button>
            <button className="btn cancel">Cancel</button>
          </div>
        </div>
      </ReactModal>
    );
  }
}
TransitionNoteDialog.propTypes = {
  isWritingTransitionNote: PropTypes.bool.isRequired,
  onWritingTransitionNoteChanged: PropTypes.func.isRequired
};