import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {linkBlue, strongOrange} from '../helpers/colors';
import {ERROR, PENDING} from '../helpers/requestStates';
import {formatEducatorName} from '../helpers/educatorName';
import Nbsp from '../components/Nbsp';
import NoteText from '../components/NoteText';
import NoteShell from '../components/NoteShell';
import Educator from '../components/Educator';
import NotifyAboutError from '../components/NotifyAboutError';
import EditableNoteText from '../components/EditableNoteText';
import RestrictedNotePresence from './RestrictedNotePresence';
import ModalSmall from './ModalSmall';


// This renders a single card for a Note of any type.
export default class NoteCard extends React.Component {
  constructor(props) {
    super(props);

    this.onTextChanged = this.onTextChanged.bind(this);
    this.debouncedSave = _.debounce(this.debouncedSave, 500);
  }

  // <EditableNoteText /> is uncontrolled, so it tracks
  // text changes, and syncs to save.
  debouncedSave(textValue) {
    if (!this.props.onSave) return;

    this.props.onSave({
      id: this.props.eventNoteId,
      eventNoteTypeId: this.props.eventNoteTypeId,
      text: textValue
    });
  }

  onTextChanged(textValue) {
    this.debouncedSave(textValue);
  }

  // No feedback, fire and forget
  onDeleteAttachmentClicked(eventNoteAttachmentId, e) {
    e.preventDefault();
    if (!confirm('Remove this link?')) return;
    this.props.onEventNoteAttachmentDeleted(eventNoteAttachmentId);
  }

  render() {
    const {noteMoment, badgeEl, educator, substanceOnly} = this.props;

    if (substanceOnly) return this.renderSubstanceEl();

    return (
      <NoteShell
        whenEl={noteMoment.format('MMMM D, YYYY')}
        badgeEl={badgeEl}
        educatorEl={<Educator educator={educator} />}
        substanceEl={this.renderSubstanceEl()}
      />
    );
  }

  renderSubstanceEl() {
    return (
      <div className="NoteCard-substance">
        {this.renderNoteSubstanceOrRedaction()}
        <div style={styles.footer}>
          {this.renderLastRevisedAt()}
          {this.renderRequestState()}
        </div>
        {this.renderAttachmentUrls()}
      </div>
    );
  }

  // For restricted notes, show a message and allow switching to another
  // component that allows viewing and editing.
  // Otherwise, show the substance of the note.
  //
  // If an onSave callback is provided, the text is editable.
  renderNoteSubstanceOrRedaction() {
    const {text, showRestrictedNoteRedaction, onSave} = this.props;

    if (showRestrictedNoteRedaction) {
      return this.renderRestrictedNoteRedaction();
    }
    if (!onSave) {
      return <NoteText text={text} />;
    }

    return (
      <EditableNoteText
        defaultText={text}
        onTextChanged={this.onTextChanged}
      />
    );
  }

  renderRestrictedNoteRedaction() {
    const {educator, urlForRestrictedNoteContent} = this.props;
    const educatorName = formatEducatorName(educator);
    const educatorFirstNameOrEmail = educatorName.indexOf(' ') !== -1
      ? educatorName.split(' ')[0]
      : educatorName;
    
    return (
      <RestrictedNotePresence
        studentFirstName={null} // The student name isn't passed
        educatorName={educatorFirstNameOrEmail}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
      />
    );
  }

  renderLastRevisedAt() {
    const {nowFn} = this.context;
    const {lastRevisedAtMoment} = this.props;
    if (!lastRevisedAtMoment) return <Nbsp style={{fontSize: 12}} />;

    const now = nowFn();
    const revisedText = (now.clone().diff(lastRevisedAtMoment, 'days') < 45)
      ? lastRevisedAtMoment.from(now)
      : `on ${lastRevisedAtMoment.format('M/D/YY')}`;
    return (
      <span style={styles.revisionsText}>
        <span>Revised </span>
        {revisedText}
      </span>
    );
  }

  renderRequestState() {
    const {requestState} = this.props;

    if (requestState === ERROR) {
      return (
        <span style={styles.error}>
          <span>Your note is not saved</span>
          <ModalSmall
            icon={<span style={{color: linkBlue, fontWeight: 'normal'}}>Learn more</span>}
            style={{fontSize: 12}}
            modalStyle={{content: {}}}
            title="Your note is not saved"
            content={this.renderErrorSavingMessage()}
          />
        </span>
      );
    }

    if (requestState === PENDING) return <span style={styles.saving}>Saving...</span>;
    return <Nbsp style={{fontSize: 12}} />;
  }

  renderErrorSavingMessage() {
    return (
      <div>
        <div style={{color: strongOrange, fontWeight: 'bold'}}>There was an error communicating with the server to save your note.</div>
        <div style={{marginTop: 20, marginBottom: 10}} >To recover, try copying the latest version of the note, reloading the page, and pasting the changes.</div>
        <NotifyAboutError src="NoteCard#renderErrorSavingMessage" />
      </div>
    );
  }

  renderAttachmentUrls() {
    const {showRestrictedNoteRedaction, attachments} = this.props;
    if (showRestrictedNoteRedaction) return null;
    
    return attachments.map(attachment => {
      return (
        <div key={attachment.id}>
          <p style={{
            display: 'flex',
            alignItems: 'flex-start',
            marginTop: 10,
            fontSize: 12
          }}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginRight: 10,
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              {attachment.url}
            </a>
            {this.renderRemoveAttachmentLink(attachment)}
          </p>
        </div>
      );
    });
  }

  // Can only remove attachments if callback is provided
  renderRemoveAttachmentLink(attachment) {
    if (!this.props.onEventNoteAttachmentDeleted) return null;

    return (
      <a
        href="#"
        onClick={this.onDeleteAttachmentClicked.bind(this, attachment.id)}
        style={{
          display: 'inline-block',
          marginLeft: 10,
          fontSize: 12,
          textDecoration: 'underline',
          color: '#999'
        }}>
        remove
      </a>
    );
  }
}
NoteCard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
NoteCard.propTypes = {
  noteMoment: PropTypes.instanceOf(moment).isRequired,
  badgeEl: PropTypes.node.isRequired,
  educator: PropTypes.object.isRequired,

  // Substance
  text: PropTypes.string.isRequired,
  lastRevisedAtMoment: PropTypes.instanceOf(moment),
  attachments: PropTypes.array.isRequired,

  // For editing eventNote only
  eventNoteId: PropTypes.number,
  eventNoteTypeId: PropTypes.number,
  onEventNoteAttachmentDeleted: PropTypes.func,
  onSave: PropTypes.func,
  requestState: PropTypes.string,

  // Configuring for different uses
  showRestrictedNoteRedaction: PropTypes.bool,
  urlForRestrictedNoteContent: PropTypes.string,
  substanceOnly: PropTypes.bool
};


const styles = {
  restrictedNoteRedaction: {
    color: '#999'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15
  },
  error: {
    fontSize: 12,
    color: strongOrange,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  saving: {
    fontSize: 12,
    color: '#aaa'
  },
  revisionsText: {
    color: '#aaa',
    fontSize: 12
  }
};
