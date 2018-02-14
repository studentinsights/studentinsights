import Educator from '../student_profile/Educator.js';
import moment from 'moment';
import * as Routes from '../helpers/Routes';

(function() {
  window.shared || (window.shared = {});

  const EditableTextComponent = window.shared.EditableTextComponent;

  const styles = {
    note: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
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
    noteText: {
      marginTop: 5,
      padding: 0,
      fontFamily: "'Open Sans', sans-serif",
      fontSize: 14,
      whiteSpace: 'pre-wrap'
    },
    student: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      maxWidth: '20%'
    },
    wrapper: {
      display: 'flex'
    }
  };

  // This renders a single card for a Note of any type.
  window.shared.NoteCard = React.createClass({
    displayName: 'NoteCard',

    propTypes: {
      attachments: React.PropTypes.array.isRequired,
      badge: React.PropTypes.element.isRequired,
      educatorId: React.PropTypes.number.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      eventNoteId: React.PropTypes.number,
      eventNoteTypeId: React.PropTypes.number,
      noteMoment: React.PropTypes.instanceOf(moment).isRequired,
      numberOfRevisions: React.PropTypes.number,
      onEventNoteAttachmentDeleted: React.PropTypes.func,
      onSave: React.PropTypes.func,
      student: React.PropTypes.object,
      text: React.PropTypes.string.isRequired
    },

    getDefaultProps: function() {
      return {
        numberOfRevisions: 0
      };
    },

    // No feedback, fire and forget
    onDeleteAttachmentClicked: function(eventNoteAttachmentId) {
      this.props.onEventNoteAttachmentDeleted(eventNoteAttachmentId);
    },

    onBlurText: function(textValue) {
      if (!this.props.onSave) return;

      this.props.onSave({
        id: this.props.eventNoteId,
        eventNoteTypeId: this.props.eventNoteTypeId,
        text: textValue
      });
    },

    render: function() {
      return (
        <div className="wrapper" style={styles.wrapper}>
          {this.renderStudentCard()}
          <div className="NoteCard" style={styles.note}>
            <div>
              <span className="date" style={styles.date}>
                {this.props.noteMoment.format('MMMM D, YYYY')}
              </span>
              {this.props.badge}
              <span style={styles.educator}>
                <Educator educator={this.props.educatorsIndex[this.props.educatorId]} />
              </span>
            </div>
            {(this.props.onSave) ? this.renderSaveableTextArea() : this.renderStaticTextArea()}
            {this.renderAttachmentUrls()}
          </div>
        </div>        
      );
    },

    renderSaveableTextArea: function() {
      return (
        <div>
          <EditableTextComponent
            style={styles.noteText}
            className="note-text"
            text={this.props.text}
            onBlurText={this.onBlurText} />
          {this.renderNumberOfRevisions()}
        </div>
      );
    },

    renderNumberOfRevisions: function () {
      const numberOfRevisions = this.props.numberOfRevisions;
      if (numberOfRevisions === 0) return null;

      return (
        <div
          style={{
            color: '#aaa',
            fontSize: 13,
            marginTop: 13
          }}>
          {(numberOfRevisions === 1)
              ? 'Revised 1 time'
              : 'Revised ' + numberOfRevisions + ' times'}
        </div>
      );
    },

    // If an onSave callback is provided, the text is editable.
    // If not (eg., for older interventions),
    renderStaticTextArea: function () {
      return (
        <div style={styles.noteText} className="note-text">
          {this.props.text}
        </div>
      );
    },

    renderAttachmentUrls: function() {
      const attachments = this.props.attachments;

      return attachments.map(function(attachment) {
        return (
          <div key={attachment.id}>
            <p>
              {'link: '}
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginTop: 20
                }}>
                {attachment.url}
              </a>
              {this.renderRemoveAttachmentLink(attachment)}
            </p>
          </div>
        );
      }, this);
    },

    // Can only remove attachments if callback is provided
    renderRemoveAttachmentLink: function(attachment) {
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
    },

    renderStudentCard: function() {
      const student = this.props.student;
      if (student) {
        return (
          <div className="StudentCard" style={styles.student}>
            <p style={{fontSize: '18px', fontWeight: 'bold', color: '#3177c9'}}>{student.last_name}, {student.first_name}</p>
            <p><a
              className="school-link"
              href={Routes.school(student.school_id)}
              style={styles.subtitleItem}>
              {student.school_name}
            </a></p>
            <p><a
              className="homeroom-link"
              href={Routes.homeroom(student.homeroom_id)}
              style={styles.subtitleItem}>
              {'Homeroom ' + student.homeroom_name}
            </a></p>
          </div>
        );
      }
    }
  });
})();
