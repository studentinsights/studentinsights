(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var StudentProfilePage = window.shared.StudentProfilePage;
  var PropTypes = window.shared.PropTypes;
  var RestrictedNotesDetails = window.shared.RestrictedNotesDetails;
  var Api = window.shared.Api;

  /*
  Holds page state, makes API calls to manipulate it.
  */
  var RestrictedNotesPageContainer = window.shared.RestrictedNotesPageContainer = React.createClass({
    displayName: 'RestrictedNotesPageContainer',

    propTypes: {
      nowMomentFn: React.PropTypes.func.isRequired,
      serializedData: React.PropTypes.object.isRequired,

      // for testing
      actions: PropTypes.actions,
      api: PropTypes.api
    },

    componentWillMount: function(props, state) {
      this.api = this.props.api || new Api();
    },

    getInitialState: function() {
      var serializedData = this.props.serializedData;

      return {
        // context
        currentEducator: serializedData.currentEducator,
        // constants
        educatorsIndex: serializedData.educatorsIndex,
        eventNoteTypesIndex: serializedData.eventNoteTypesIndex,
        // data
        feed: serializedData.feed,
        student: serializedData.student,
        // ui
        requests: {
          saveNotes: null
        }
      };
    },

    onClickSaveNotes: function(eventNoteParams) {
      this.setState({ requests: merge(this.state.requests, { saveNotes: 'pending' }) });
      this.api.saveNotes(this.state.student.id, eventNoteParams)
        .done(this.onSaveNotesDone)
        .fail(this.onSaveNotesFail);
    },

    onSaveNotesDone: function(response) {
      var updatedEventNotes = this.state.feed.event_notes.concat([response]);
      var updatedFeed = merge(this.state.feed, { event_notes: updatedEventNotes });
      this.setState({
        feed: updatedFeed,
        requests: merge(this.state.requests, { saveNotes: null })
      });
    },

    onSaveNotesFail: function(request, status, message) {
      this.setState({ requests: merge(this.state.requests, { saveNotes: 'error' }) });
    },

    render: function() {
      return dom.div({ className: 'RestrictedNotesPageContainer' },
        createEl(RestrictedNotesDetails, merge(_.pick(this.state,
          'currentEducator',
          'educatorsIndex',
          'eventNoteTypesIndex',
          'feed',
          'student',
          'requests'
        ), {
          nowMomentFn: this.props.nowMomentFn,
          actions: this.props.actions || {
            onColumnClicked: this.onColumnClicked,
            onClickSaveNotes: this.onClickSaveNotes,
            onClickSaveService: this.onClickSaveService,
            onClickDiscontinueService: this.onClickDiscontinueService
          }
        }))
      );
    }
  });
})();
