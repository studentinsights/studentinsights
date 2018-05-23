import Educator from '../components/Educator';
import NoteText from '../components/NoteText';
import EditableNoteText from '../components/EditableNoteText';
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

    noteStyle: function() {
      const {eventNoteTypeId} = this.props;

      if (eventNoteTypeId !== 307) return styles.note;

      // Add yellow border highlight to High School Transition Notes
      return {...styles.note, border: '5px solid #FFFF99'};
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
          <div className="NoteCard" style={this.noteStyle()}>
            {this.renderPinIcon()}
            <div>
              <span className="date" style={styles.date}>
                {this.props.noteMoment.format('MMMM D, YYYY')}
              </span>
              {this.props.badge}
              <span style={styles.educator}>
                <Educator educator={this.props.educatorsIndex[this.props.educatorId]} />
              </span>
            </div>
            {this.renderText()}
            {this.renderAttachmentUrls()}
          </div>
        </div>
      );
    },

    renderPinIcon() {
      const {eventNoteTypeId} = this.props;

      if (eventNoteTypeId !== 307) return null;

      return (
        <span style={{height: 20}}>
          <svg>
            <path d="M75.887,54.474C72.062,50.078,67.54,51,62.328,46.157c-2.586-2.403-2.34-17.358-2.34-17.358s-0.194-12.967,2.462-15.624  c1.836-1.832,5.06-2.306,6.938-4.15c0.018-0.013,0.03-0.025,0.043-0.042c0.406-0.406,0.735-0.884,0.978-1.451  c0.03-0.06,0.063-0.106,0.084-0.165c0.165-0.432,0.254-0.939,0.301-1.485c0.013-0.14,0.08-0.258,0.08-0.398  c0-0.025-0.013-0.046-0.017-0.072c0.004-0.038,0.017-0.067,0.017-0.105c0-0.093-0.071-0.14-0.08-0.225  C70.577,2.526,68.5,0.5,65.89,0.5H34.672c-2.61,0-4.688,2.026-4.903,4.582c-0.009,0.084-0.081,0.131-0.081,0.225  c0,0.038,0.013,0.067,0.017,0.105c-0.004,0.026-0.017,0.047-0.017,0.072c0,0.14,0.068,0.258,0.081,0.398  c0.046,0.545,0.135,1.053,0.3,1.485c0.021,0.059,0.055,0.105,0.085,0.165c0.241,0.567,0.571,1.045,0.977,1.451  c0.013,0.017,0.025,0.029,0.042,0.042c1.878,1.845,5.102,2.318,6.938,4.15c2.657,2.657,2.462,15.624,2.462,15.624  s0.246,14.955-2.34,17.358C33.022,51,28.5,50.078,24.676,54.474c-2.708,3.114-2.212,8.664-2.212,8.664h25.671v22.621L50.055,99.5  h0.457l1.921-13.741V63.138h25.666C78.099,63.138,78.594,57.588,75.887,54.474z">
            </path>
          </svg>
        </span>
      );
    },

    // If an onSave callback is provided, the text is editable.
    // This is for older interventions that are read-only
    // because of changes to the server data model.
    renderText() {
      const {onSave, text, numberOfRevisions}= this.props;
      if (onSave) {
        return (
          <EditableNoteText
            text={text}
            numberOfRevisions={numberOfRevisions}
            onBlurText={this.onBlurText} />
        );
      }

      return <NoteText text={text} />;
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
