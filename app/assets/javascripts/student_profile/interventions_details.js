(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;
  var ServicesDetails = window.shared.ServicesDetails;
  var NotesDetails = window.shared.NotesDetails;

  var styles = {
    container: {
      display: 'flex'
    }
  }

  /*
  The bottom region of the page, showing notes about the student, services
  they are receiving, and allowing users to enter new information about
  these as well.
  */
  var InterventionsDetails = window.shared.InterventionsDetails = React.createClass({
    propTypes: {
      student: React.PropTypes.object.isRequired,
      interventionTypesIndex: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired,
      feed: PropTypes.feed.isRequired,
      actions: PropTypes.actions.isRequired,
      requests: PropTypes.requests.isRequired
    },

    render: function() {
      return dom.div({ className: 'InterventionsDetails', style: styles.container },
        createEl(NotesDetails, {
          student: this.props.student,
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          educatorsIndex: this.props.educatorsIndex,
          currentEducator: this.props.currentEducator,
          feed: this.props.feed,
          actions: this.props.actions,
          requests: this.props.requests
        }),
        createEl(ServicesDetails, {
          student: this.props.student,
          serviceTypesIndex: this.props.serviceTypesIndex,
          educatorsIndex: this.props.educatorsIndex,
          currentEducator: this.props.currentEducator,
          feed: this.props.feed,
          actions: this.props.actions,
          requests: this.props.requests
        })
      );
    },
  });
})();
