import Educator from '../components/Educator';
import NoteText from '../components/NoteText';
import moment from 'moment';
import * as Routes from '../helpers/Routes';

(function() {
  window.shared || (window.shared = {});

  const styles = {
    note: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10,
      width: '100%'
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
      // If an onSave callback is provided, the text is editable.
      // If not (eg., for older interventions),
      const isEditable = this.props.onSave !== undefined;

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
            <NoteText
              text={this.props.text}
              isEditable={isEditable}
              onBlurText={isEditable ? this.onBlurText : undefined} />
            {this.renderAttachmentUrls()}
          </div>
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

    renderHomeroomOrGrade: function(student) {
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
    },

    renderSchool: function(student) {
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
    },

    renderStudentCard: function() {
      const student = this.props.student;
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
  });
})();
