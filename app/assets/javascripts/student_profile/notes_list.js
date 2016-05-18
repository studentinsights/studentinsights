(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator;
  var PropTypes = window.shared.PropTypes;
  var FeedHelpers = window.shared.FeedHelpers;
  var moment = window.moment;

  var styles = {
    noItems: {
      margin: 10
    },
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
    badge: {
      display: 'inline-block',
      background: '#eee',
      outline: '3px solid #eee',
      width: '10em',
      textAlign: 'center',
      marginLeft: 10,
      marginRight: 10
    },
    educator: {
      paddingLeft: 5,
      display: 'inline-block'
    },
    noteText: {
      marginTop: 5,
      padding: 0,
      resize: 'none',
      overflow: 'auto',
      fontFamily: "'Open Sans', sans-serif",
      fontSize: 14,
      whiteSpace: 'pre-wrap'
    },
    cancelEditNoteButton: {
      color: 'black',
      background: '#eee',
      marginLeft: 10,
      marginRight: 10
    }
  };

  // This renders a single card for a Note of any type.
  var NoteCard = React.createClass({
    displayName: 'NoteCard',

    propTypes: {
      noteMoment: React.PropTypes.instanceOf(moment).isRequired,
      educatorId: React.PropTypes.number.isRequired,
      badge: React.PropTypes.element.isRequired,
      text: React.PropTypes.string.isRequired,
      onSave: React.PropTypes.func,
      eventNoteId: React.PropTypes.number,
      eventNoteTypeId: React.PropTypes.number
    },

    getInitialState: function() {
      return {
        text: this.props.text
      };
    },

    onBlurText: function(event) {
      var params = {
        id: this.props.eventNoteId,
        eventNoteTypeId: this.props.eventNoteTypeId,
        text: this.state.text
      };
      this.props.onSave(params);
    },

    shouldComponentUpdate: function(nextProps){
      return nextProps.html !== ReactDOM.findDOMNode(this).innerHTML;
    },

    emitChange: function(){debugger;
      var text = ReactDOM.findDOMNode(this).getElementsByClassName('note-text')[0].innerHTML;

      if (text !== this.lastText) {
        this.setState({ text: text });
      }

      this.lastText = text;
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
        dom.div({
          contentEditable: true,
          className: 'note-text',
          // rows: 10,
          style: styles.noteText,
          // ref: function(ref) { this.textareaRef = ref; }.bind(this),
          // defaultValue: this.state.text,
          dangerouslySetInnerHTML: { __html: this.state.text },
          // onChange: this.onChangeText,
          onInput: this.emitChange,
          onBlur: this.onBlurText
        })
        // dom.textarea({
        //   className: 'note-text',
        //   rows: 10,
        //   style: styles.noteText,
        //   ref: function(ref) { this.textareaRef = ref; }.bind(this),
        //   defaultValue: this.state.text,
        //   // onChange: this.onChangeText,
        //   onBlur: this.onBlurText
        // })
      );
    }
  });

  /*
  Renders the list of notes.
  */
  var NotesList = window.shared.NotesList = React.createClass({
    displayName: 'NotesList',

    propTypes: {
      feed: PropTypes.feed.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      onSaveNote: React.PropTypes.func.isRequired
    },

    render: function() {
      var mergedNotes = FeedHelpers.mergedNotes(this.props.feed);
      return dom.div({ className: 'NotesList' }, (mergedNotes.length === 0) ? dom.div({ style: styles.noItems }, 'No notes') : mergedNotes.map(function(mergedNote) {
        switch (mergedNote.type) {
          case 'event_notes': return this.renderEventNote(mergedNote);
          case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
        }
      }, this));
    },

    renderEventNoteTypeBadge: function(eventNoteTypeId) {
      var eventNoteType = this.props.eventNoteTypesIndex[eventNoteTypeId];
      if (eventNoteType === undefined) return null;
      return dom.span({ style: styles.badge }, eventNoteType.name);
    },

    renderEventNote: function(eventNote) {
      return createEl(NoteCard, {
        key: ['event_note', eventNote.id].join(),
        eventNoteId: eventNote.id,
        eventNoteTypeId: eventNote.event_note_type_id,
        noteMoment: moment.utc(eventNote.recorded_at),
        badge: this.renderEventNoteTypeBadge(eventNote.event_note_type_id),
        educatorId: eventNote.educator_id,
        text: eventNote.text,
        educatorsIndex: this.props.educatorsIndex,
        onSave: this.props.onSaveNote
      });
    },

    // TODO(kr) support custom intervention type
    // This assumes that the `end_date` field is not accurate enough to be worth splitting
    // this out into two note entries.
    renderDeprecatedIntervention: function(deprecatedIntervention) {
      return createEl(NoteCard, {
        key: ['deprecated_intervention', deprecatedIntervention.id].join(),
        noteMoment: moment.utc(deprecatedIntervention.start_date_timestamp),
        badge: dom.span({ style: styles.badge }, 'Old intervention'),
        educatorId: deprecatedIntervention.educator_id,
        text: _.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n'),
        educatorsIndex: this.props.educatorsIndex
      });
    },

  });
})();
