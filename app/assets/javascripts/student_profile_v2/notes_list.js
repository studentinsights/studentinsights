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
    badge: {
      display: 'inline-block',
      background: '#eee',
      outline: '3px solid #eee',
      width: '10em',
      textAlign: 'center',
      marginLeft: 10,
      marginRight: 10
    },
    date: {
      paddingRight: 10,
      fontWeight: 'bold',
      display: 'inline-block'
    },
    educator: {
      paddingLeft: 5,
      display: 'inline-block'
    },
    noteText: {
      marginTop: 5
    }
  };

  // This renders a single card for a Note of any type.
  var NoteCard = React.createClass({
    displayName: 'NoteCard',

    propTypes: {
      noteMoment: React.PropTypes.instanceOf(moment).isRequired,
      educatorId: React.PropTypes.number.isRequired,
      badge: React.PropTypes.element.isRequired,
      text: React.PropTypes.string.isRequired
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
        dom.div({ style: { whiteSpace: 'pre-wrap' } },
          dom.div({ style: styles.noteText }, this.props.text)
        )
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
      educatorsIndex: React.PropTypes.object.isRequired
    },

    render: function() {
      var mergedNotes = FeedHelpers.mergedNotes(this.props.feed);
      return dom.div({ className: 'NotesList' }, (mergedNotes.length === 0) ? dom.div({ style: styles.noItems }, 'No notes') : mergedNotes.map(function(mergedNote) {
        switch (mergedNote.type) {
          case 'event_notes': return this.renderEventNote(mergedNote);
          case 'deprecated_notes': return this.renderDeprecatedNote(mergedNote);
          case 'deprecated_interventions': return this.renderDeprecatedIntervention(mergedNote);
          case 'deprecated_progress_notes': return this.renderDeprecatedProgressNote(mergedNote);
        }
      }, this));
    },

    renderEventNoteTypeBadge: function(eventNoteTypeId) {
      switch (eventNoteTypeId) {
        case 1: return dom.span({ style: styles.badge }, 'SST meeting');
        case 2: return dom.span({ style: styles.badge }, 'MTSS meeting');
        case 3: return dom.span({ style: styles.badge }, 'Family');
        case 5: return dom.span({ style: styles.badge }, 'Something else');
      }

      return null;
    },

    renderEventNote: function(eventNote) {
      return createEl(NoteCard, {
        key: ['event_note', eventNote.id].join(),
        noteMoment: moment.utc(eventNote.recorded_at),
        badge: this.renderEventNoteTypeBadge(eventNote.event_note_type_id),
        educatorId: eventNote.educator_id,
        text: eventNote.text,
        educatorsIndex: this.props.educatorsIndex
      });
    },

    renderDeprecatedNote: function(deprecatedNote) {
      return createEl(NoteCard, {
        key: ['deprecated_note', deprecatedNote.id].join(),
        noteMoment: moment.utc(deprecatedNote.created_at_timestamp),
        badge: dom.span({ style: styles.badge }, 'Older note'),
        educatorId: deprecatedNote.educator_id,
        text: deprecatedNote.content,
        educatorsIndex: this.props.educatorsIndex
      });
    },

    // TODO(kr) support custom intervention type
    // This assumes that the `end_date` field is not accurate enough to be worth splitting
    // this out into two note entries.
    renderDeprecatedIntervention: function(deprecatedIntervention) {
      return createEl(NoteCard, {
        key: ['deprecated_intervention', deprecatedIntervention.id].join(),
        noteMoment: moment.utc(deprecatedIntervention.start_date_timestamp),
        badge: dom.span({ style: styles.badge }, 'Older intervention'),
        educatorId: deprecatedIntervention.educator_id,
        text: _.compact([deprecatedIntervention.name, deprecatedIntervention.comment, deprecatedIntervention.goal]).join('\n'),
        educatorsIndex: this.props.educatorsIndex
      });
    },

    // TODO(kr) not done!
    renderDeprecatedProgressNote: function(deprecatedProgressNote) {
      return null;
    }
  });
})();