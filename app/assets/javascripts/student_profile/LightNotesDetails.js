import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import SectionHeading from '../components/SectionHeading';
import LightHelpBubble from './LightHelpBubble';
import NotesList from './NotesList';
import TakeNotes from './TakeNotes';
import * as tf from '@tensorflow/tfjs';
import {apiFetchJson} from '../helpers/apiFetchJson';
import _ from 'lodash';


/*
The bottom region of the page, showing notes about the student, services
they are receiving, and allowing users to enter new information about
these as well.
*/
export default class LightNotesDetails extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      isTakingNotes: false
    };

    this.onClickTakeNotes = this.onClickTakeNotes.bind(this);
    this.onClickSaveNotes = this.onClickSaveNotes.bind(this);
    this.onCancelNotes = this.onCancelNotes.bind(this);
  }

  componentDidMount() {
    this.startTensorFlow();
  }

  // From https://js.tensorflow.org/tutorials/import-keras.html
  // Using https://github.com/tensorflow/tfjs-examples/tree/master/sentiment
  // https://github.com/tensorflow/tfjs-examples/blob/6fa70fa93b394c092ce5f492c1536e7808e4686d/sentiment/index.js#L60
  startTensorFlow() {
    console.log('startTensorFlow');

    tf.loadModel('/experimental/model.json')
      .then(this.modelLoaded.bind(this))
      .catch(err => console.error(err));
  }

  modelLoaded(model) {
    console.log('modelLoaded', model);

    apiFetchJson('/experimental/token_dictionary.json')
      .then(this.dictionaryLoaded.bind(this, model));
  }

  dictionaryLoaded(model, dictionary) {
    const texts = [
      'filed a 51a for abuse',
      'hospitalized for suicide attempt',
      'Spoke with primary care doctor about depression and current medication.',
      'Discussed challenges with nonsense word decoding fluency',
      'called home about homework being late'
    ];

    texts.forEach(text => {
      const score = predict(model, dictionary, text);
      console.log('predict', score, text);
    });
  }

  isTakingNotes() {
    return (
      this.state.isTakingNotes ||
      this.props.requests.saveNote !== null ||
      this.props.noteInProgressText.length > 0 ||
      this.props.noteInProgressAttachmentUrls.length > 0
    );
  }

  onClickTakeNotes(event) {
    this.setState({ isTakingNotes: true });
  }

  onCancelNotes(event) {
    this.setState({ isTakingNotes: false });
  }

  onClickSaveNotes(eventNoteParams, event) {
    this.props.actions.onClickSaveNotes(eventNoteParams);
    this.setState({ isTakingNotes: false });
  }

  render() {
    const {student, title, currentEducator} = this.props;

    return (
      <div className="LightNotesDetails" style={styles.notesContainer}>
        {<SectionHeading titleStyle={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', padding: 2}}>
            <span>{title} for {student.first_name}</span>
            <LightHelpBubble
              title={this.props.helpTitle}
              content={this.props.helpContent} />
          </div>
          {!this.isTakingNotes() && this.renderTakeNotesButton()}
        </SectionHeading>}
        <div>
          {this.isTakingNotes() && this.renderTakeNotesDialog()}
          <NotesList
            currentEducatorId={currentEducator.id}
            feed={this.props.feed}
            canUserAccessRestrictedNotes={currentEducator.can_view_restricted_notes}
            educatorsIndex={this.props.educatorsIndex}
            onSaveNote={this.onClickSaveNotes}
            onEventNoteAttachmentDeleted={this.props.actions.onDeleteEventNoteAttachment} />
        </div>
      </div>
    );
  }

  renderTakeNotesDialog() {
    const {
      currentEducator,
      noteInProgressText,
      noteInProgressType,
      noteInProgressAttachmentUrls,
      actions,
      requests
    } = this.props;

    return (
      <TakeNotes
        // TODO(kr) thread through
        nowMoment={moment.utc()}
        currentEducator={currentEducator}
        onSave={this.onClickSaveNotes}
        onCancel={this.onCancelNotes}
        requestState={requests.saveNote}
        noteInProgressText={noteInProgressText}
        noteInProgressType={noteInProgressType}
        noteInProgressAttachmentUrls={noteInProgressAttachmentUrls}
        onClickNoteType={actions.onClickNoteType}
        onChangeNoteInProgressText={actions.onChangeNoteInProgressText}
        onChangeAttachmentUrl={actions.onChangeAttachmentUrl}
        showRestrictedCheckbox={currentEducator.can_view_restricted_notes}
      />
    );
  }

  renderTakeNotesButton() {
    return (
      <button
        className="btn take-notes"
        style={{display: 'inline-block', margin: 0}}
        onClick={this.onClickTakeNotes}>
        <span><span style={{fontWeight: 'bold', paddingRight: 5}}>+</span><span>note</span></span>
      </button>
    );
  }
}

LightNotesDetails.propTypes = {
  student: PropTypes.object.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  currentEducator: PropTypes.shape({
    can_view_restricted_notes: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    onClickSaveNotes: PropTypes.func.isRequired,
    onEventNoteAttachmentDeleted: PropTypes.func,
    onDeleteEventNoteAttachment: PropTypes.func,
    onChangeNoteInProgressText: PropTypes.func.isRequired,
    onClickNoteType: PropTypes.func.isRequired,
    onChangeAttachmentUrl: PropTypes.func.isRequired,
  }),
  feed: InsightsPropTypes.feed.isRequired,
  requests: PropTypes.object.isRequired,

  noteInProgressText: PropTypes.string.isRequired,
  noteInProgressType: PropTypes.number,
  noteInProgressAttachmentUrls: PropTypes.arrayOf(
    PropTypes.string
  ).isRequired,

  title: PropTypes.string.isRequired,
  helpContent: PropTypes.node.isRequired,
  helpTitle: PropTypes.string.isRequired,
};


const styles = {
  notesContainer: {
    width: '50%',
    marginRight: 20
  }
};

// function toBagOfOneHots(wordIndex) {
//   const vocabulary_space = 13000;
//   // results = np.zeros((len(list_of_word_indexes), dimension))
//   //   for i, word_indexes in enumerate(list_of_word_indexes):
//   //     for j, word_index in enumerate(word_indexes):
//   //       results[i, word_index] = 1.
//   //   return results
// }

/**
 * Pad and truncate all sequences to the same length
 *
 * @param {number[][]} sequences The sequences represented as an array of array
 *   of numbers.
 * @param {number} maxLen Maximum length. Sequences longer than `maxLen` will be
 *   truncated. Sequences shorter than `maxLen` will be padded.
 * @param {'pre'|'post'} padding Padding type.
 * @param {'pre'|'post'} truncating Truncation type.
 * @param {number} value Padding value.
 */
const PAD_CHAR = 0;
// const OOV_CHAR = 2;
function padSequences(
    sequences, maxLen, padding = 'pre', truncating = 'pre', value = PAD_CHAR) {
  // TODO(cais): This perhaps should be refined and moved into tfjs-preproc.
  return sequences.map(seq => {
    // Perform truncation.
    if (seq.length > maxLen) {
      if (truncating === 'pre') {
        seq.splice(0, seq.length - maxLen);
      } else {
        seq.splice(maxLen, seq.length - maxLen);
      }
    }

    // Perform padding.
    if (seq.length < maxLen) {
      const pad = [];
      for (let i = 0; i < maxLen - seq.length; ++i) {
        pad.push(value);
      }
      if (padding === 'pre') {
        seq = pad.concat(seq);
      } else {
        seq = seq.concat(pad);
      }
    }

    return seq;
  });
}

/* eslint-disable no-console */
function predict(model, dictionary, text) {
  function log() {
    // console.log.apply(console, arguments);
  }

  try {
    log('predict', text);
    window.model = model;
    window.dictionary = dictionary;

    // Convert to lower case and remove all punctuations.
    const inputText = text.trim().toLowerCase().replace(/(\.|\,|\!)/g, '').split(' ');
    log('inputText', inputText);

    // Convert the words to a sequence of word indices.
    const sequence = _.compact(inputText.map(word => dictionary[word]));
    log('sequence', sequence);
    
    // Perform truncation and padding.

    // const input = tf.tensor2d(sequence, [1, 13000]);
    log('starting...');

    // const input = tf.tensor2d(sequence);
    // const paddedSequence = padSequences([sequence], 13000);
    // log('paddedSequence', paddedSequence);
    // sequence.forEach(index => paddedSequence[index] = 1);
    // log('ones', _.flatMap(paddedSequence, (val, i) => val === 1 ? [i] : []));
    const paddedSequence = _.range(0, 13000).map(index => {
      return (sequence.indexOf(index) !== -1) ? 1 : 0;
    });
    log('ones', _.flatMap(paddedSequence, (val, i) => val === 1 ? [i] : []));

    // do prediction
    const input = tf.tensor2d(paddedSequence, [1, 13000]);
    log('input', input);
    const prediction = model.predict(input);
    log('prediction', prediction);
    const score = prediction.dataSync()[0];
    log('score', score);
    prediction.dispose();
    return score;
  } catch(err) {
    console.error('caught');
    console.error(err);
    return null;
  }
}


