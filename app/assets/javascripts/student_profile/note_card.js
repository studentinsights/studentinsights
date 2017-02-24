(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;

  var Educator = window.shared.Educator;
  var EditableTextComponent = window.shared.EditableTextComponent;
  var moment = window.moment;

  var styles = {
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
    }
  };

  // This renders a single card for a Note of any type.
  window.shared.NoteCard = React.createClass({
    displayName: 'NoteCard',

    propTypes: {
      noteMoment: React.PropTypes.instanceOf(moment).isRequired,
      educatorId: React.PropTypes.number.isRequired,
      badge: React.PropTypes.element.isRequired,
      text: React.PropTypes.string.isRequired,
      eventNoteId: React.PropTypes.number,
      eventNoteTypeId: React.PropTypes.number,
      educatorsIndex: React.PropTypes.object.isRequired,
      attachments: React.PropTypes.array.isRequired,
      onSave: React.PropTypes.func,
      onEventNoteAttachmentDeleted: React.PropTypes.func,
      numberOfRevisions: React.PropTypes.number
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
      return dom.div({
        className: 'NoteCard',
        style: styles.note
      },
        dom.div({},
          dom.span({ className: 'date', style: styles.date }, this.props.noteMoment.format('MMMM D, YYYY')),
          this.props.badge,
          dom.span({ style: styles.educator }, createEl(Educator, {
            educator: this.props.educatorsIndex[this.props.educatorId]
          }))
        ),
        (this.props.onSave) ? this.renderSaveableTextArea() : this.renderStaticTextArea(),
        this.renderAttachmentUrls()
      );
    },

    renderSaveableTextArea: function() {
      return dom.div({},
        createEl(EditableTextComponent, {
          style: styles.noteText,
          className: 'note-text',
          text: this.props.text,
          onBlurText: this.onBlurText
        }),
        this.renderNumberOfRevisions()
      );
    },

    renderNumberOfRevisions: function () {
      var numberOfRevisions = this.props.numberOfRevisions;
      if (numberOfRevisions === 0) return null;

      return dom.div({
        style: {
          color: '#aaa',
          fontSize: 13,
          marginTop: 13
        }
      },
        ((numberOfRevisions === 1)
          ? 'Revised 1 time'
          : 'Revised ' + numberOfRevisions + ' times')
      );
    },

    // If an onSave callback is provided, the text is editable.
    // If not (eg., for older interventions),
    renderStaticTextArea: function () {
      return dom.div({
        style: styles.noteText,
        className: 'note-text'
      }, this.props.text);
    },

    renderAttachmentUrls: function() {
      var attachments = this.props.attachments;

      return attachments.map(function(attachment) {
        return dom.div({ key: attachment.id },
          dom.p({}, 'link: ',
            dom.a({
              href: attachment.url,
              target: '_blank',
              rel: 'noopener noreferrer',
              style: {
                display: 'inline-block',
                marginTop: 20
              }
            }, attachment.url),
            this.renderRemoveAttachmentLink(attachment)
          )
        );
      }, this);
    },

    // Can only remove attachments if callback is provided
    renderRemoveAttachmentLink: function(attachment) {
      if (!this.props.onEventNoteAttachmentDeleted) return null;

      return (
        dom.a({
          onClick: this.onDeleteAttachmentClicked.bind(this, attachment.id),
          style: {
            display: 'inline-block',
            marginLeft: 10
          }
        }, '(remove)')
      );
    }
  });
})();
