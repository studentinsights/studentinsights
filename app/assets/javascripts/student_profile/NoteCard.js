import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import * as Routes from '../helpers/Routes';
import {linkBlue, strongOrange} from '../helpers/colors';
import {ERROR, PENDING} from '../helpers/requestStates';
import {formatEducatorName} from '../helpers/educatorName';
import Nbsp from '../components/Nbsp';
import Educator from '../components/Educator';
import NoteText from '../components/NoteText';
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

  educator() {
    const {educatorId, educatorsIndex} = this.props;
    if (!educatorId) return null;
    return educatorsIndex[educatorId];
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
  onDeleteAttachmentClicked(eventNoteAttachmentId) {
    this.props.onEventNoteAttachmentDeleted(eventNoteAttachmentId);
  }

  render() {
    const {includeStudentPanel} = this.props;
    const educator = this.educator();
    return (
      <div className="wrapper" style={styles.wrapper}>
        {includeStudentPanel && this.renderStudentCard()}
        <div className="NoteCard" style={styles.note}>
          <div style={styles.titleLine}>
            <span className="date" style={styles.date}>
              {this.props.noteMoment.format('MMMM D, YYYY')}
            </span>
            {this.props.badge}
            {educator && (
              <span style={styles.educator}>
                <Educator educator={educator} />
              </span>
            )}
          </div>
          {this.renderNoteSubstanceOrRedaction()}
          {this.renderAttachmentUrls()}
        </div>
      </div>        
    );
  }

  // For restricted notes, show a message and allow switching to another
  // component that allows viewing and editing.
  // Otherwise, show the substance of the note.
  renderNoteSubstanceOrRedaction() {
    const {showRestrictedNoteRedaction} = this.props;
    return (showRestrictedNoteRedaction)
      ? this.renderRestrictedNoteRedaction()
      : this.renderText();
  }

  // The student name may or not be present.
  renderRestrictedNoteRedaction() {
    const {student, urlForRestrictedNoteContent} = this.props;
    const educatorName = formatEducatorName(this.educator());
    const educatorFirstNameOrEmail = educatorName.indexOf(' ') !== -1
      ? educatorName.split(' ')[0]
      : educatorName;
    
    return (
      <RestrictedNotePresence
        studentFirstName={student ? student.first_name : null}
        educatorName={educatorFirstNameOrEmail}
        urlForRestrictedNoteContent={urlForRestrictedNoteContent}
      />
    );
  }

  // If an onSave callback is provided, the text is editable.
  // This is for older interventions that are read-only 
  // because of changes to the server data model.
  renderText() {
    const {onSave, text} = this.props;
    if (onSave) {
      return (
        <div style={styles.text}>
          <EditableNoteText
            defaultText={text}
            onTextChanged={this.onTextChanged}
          />
          <div style={styles.footer}>
            {this.renderLastRevisedAt()}
            {this.renderRequestState()}
          </div>
        </div>
      );
    }
    
    return <NoteText text={text} />;        
  }

  renderLastRevisedAt() {
    const {nowFn} = this.context;
    const {lastRevisedAtMoment} = this.props;
    if (!lastRevisedAtMoment) return <Nbsp />;

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
    return <Nbsp />;
  }

  renderErrorSavingMessage() {
    return (
      <div>
        <div style={{color: strongOrange, fontWeight: 'bold'}}>There was an error communicating with the server to save your note.</div>
        <div style={{marginTop: 20, marginBottom: 5}} >To recover, try copying the latest version of the note, reloading the page, and pasting the changes.</div>
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
            alignItems: 'center',
            marginTop: 10
          }}>
            <span>link:</span>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginLeft: 10,
                marginRight: 10,
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
        onClick={this.onDeleteAttachmentClicked.bind(this, attachment.id)}
        style={{
          display: 'inline-block',
          marginLeft: 10
        }}>
        (remove)
      </a>
    );
  }

  renderHomeroomOrGrade(student) {
    if (student.grade < 9) {
      if (student.homeroom_id) {
        return (
          <p><a
            className="homeroom-link"
            href={Routes.homeroom(student.homeroom_id)}>
            {'Homeroom ' + student.homeroom_name}
          </a></p>
        );
      }
      else {
        return (
          <p>No Homeroom</p>
        );
      }
    }
    else {
      return (
        <p>{student.grade}th Grade</p>
      );
    }
  }

  renderSchool(student) {
    if (student.school_id) {
      return (
        <p><a
          className="school-link"
          href={Routes.school(student.school_id)}>
          {student.school_name}
        </a></p>
      );
    }
    else {
      return (
        <p>No School</p>
      );
    }
  }

  renderStudentCard() {
    const {student} = this.props;
    if (student) {
      return (
        <div className="studentCard" style={styles.studentCard}>
          <p><a style={styles.studentName} href={Routes.studentProfile(student.id)}>
            {student.last_name}, {student.first_name}
          </a></p>
          {this.renderSchool(student)}
          {this.renderHomeroomOrGrade(student)}
        </div>
      );
    }
  }
}
NoteCard.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
NoteCard.propTypes = {
  attachments: PropTypes.array.isRequired,
  badge: PropTypes.element.isRequired,
  educatorId: PropTypes.number,
  educatorsIndex: PropTypes.object.isRequired,
  noteMoment: PropTypes.instanceOf(moment).isRequired,
  text: PropTypes.string.isRequired,
  lastRevisedAtMoment: PropTypes.instanceOf(moment),

  // For editing eventNote only
  eventNoteId: PropTypes.number,
  eventNoteTypeId: PropTypes.number,
  onEventNoteAttachmentDeleted: PropTypes.func,
  onSave: PropTypes.func,
  requestState: PropTypes.string,

  // Configuring for different uses
  showRestrictedNoteRedaction: PropTypes.bool,
  urlForRestrictedNoteContent: PropTypes.string,
  
  // For side panel for my notes page
  includeStudentPanel: PropTypes.bool,
  student: PropTypes.object
};


const styles = {
  note: {
    border: '1px solid #eee',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%'
  },
  titleLine: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  date: {
    display: 'inline-block',
    width: '11em',
    paddingRight: 10,
    fontWeight: 'bold'
  },
  educator: {
    paddingLeft: 5,
    display: 'inline-block'
  },
  studentCard: {
    border: '1px solid #eee',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '25%'
  },
  studentName: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#3177c9',
    marginBottom: '5%'
  },
  wrapper: {
    display: 'flex'
  },
  restrictedNoteRedaction: {
    color: '#999'
  },
  text: {
    marginTop: 10
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