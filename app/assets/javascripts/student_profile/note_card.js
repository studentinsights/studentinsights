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
  };

  // This renders a single card for a Note of any type.
  var NoteCard = window.shared.NoteCard = React.createClass({
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
      onEventNoteAttachmentDeleted: React.PropTypes.func
    },

    // No feedback, fire and forget
    onDeleteAttachmentClicked: function(eventNoteAttachmentId) {
      this.props.onEventNoteAttachmentDeleted(eventNoteAttachmentId);
    },

    onBlurText: function (textValue) {
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
        createEl(EditableTextComponent, {
          text: this.props.text,
          onBlurText: this.onBlurText
        }),
        this.renderAttachmentUrls()
      );
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
            dom.a({
              onClick: this.onDeleteAttachmentClicked.bind(this, attachment.id),
              style: {
                display: 'inline-block',
                marginLeft: 10
              }
            }, '(remove)')
          )
        )
      }, this);
    },

  });
})();
