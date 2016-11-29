(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator;
  var serviceColor = window.shared.serviceColor;
  var moment = window.moment;

  var styles = {
    noItems: {
      margin: 10
    },
    service: {
      border: '1px solid #eee',
      padding: 15,
      marginTop: 10,
      marginBottom: 10
    },
    userText: {
      whiteSpace: 'pre-wrap'
    },
    daysAgo: {
      opacity: 0.25,
      paddingLeft: '0.5em'
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
    },
    cancel: {
      background: 'white',
      color: 'black'
    },
    discontinueConfirm: {
      background: '#E2664A'
    }
  };


  /*
  Renders the list of services.
  */
  var ServicesList = window.shared.ServicesList = React.createClass({
    displayName: 'ServicesList',

    propTypes: {
      servicesFeed: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      discontinueServiceRequests: React.PropTypes.object.isRequired,
      onClickDiscontinueService: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
      return {
        hoveringDiscontinueServiceId: null,
        hoveringCancelServiceId: null,
        discontinuingServiceId: null
      };
    },

    resetDiscontinueState: function() {
      return {
        discontinuingServiceId: null,
        hoveringCancelServiceId: null,
        hoveringDiscontinueServiceId: null
      };
    },

    // Confirmation step
    onClickDiscontinueService: function(serviceId) {
      if (this.state.discontinuingServiceId !== serviceId) {
        this.setState(merge(this.resetDiscontinueState(), {
          discontinuingServiceId: serviceId,
        }));
        return;
      }

      this.props.onClickDiscontinueService(serviceId);
      this.setState(this.resetDiscontinueState());
    },

    onClickCancelDiscontinue: function(serviceId) {
      this.setState(this.resetDiscontinueState());
    },

    onMouseEnterDiscontinue: function(serviceId) {
      this.setState({ hoveringDiscontinueServiceId: serviceId });
    },

    onMouseLeaveDiscontinue: function() {
      this.setState({ hoveringDiscontinueServiceId: null });
    },

    onMouseEnterCancel: function(serviceId) {
      this.setState({ hoveringCancelServiceId: serviceId });
    },

    onMouseLeaveCancel: function() {
      this.setState({ hoveringCancelServiceId: null });
    },

    wasDiscontinued: function(service) {
      return (service.discontinued_by_educator_id !== null);
    },

    // Active services before inactive, then sorted by time
    sortedMergedServices: function(servicesFeed) {
      return _.flatten([
        _.sortBy(servicesFeed.active, 'date_started').reverse(),
        _.sortBy(servicesFeed.discontinued, 'date_started').reverse()
      ]);
    },

    render: function() {
      var elements = (this.props.servicesFeed.active.length === 0 && this.props.servicesFeed.discontinued.length === 0)
        ? dom.div({ style: styles.noItems }, 'No services')
        : this.sortedMergedServices(this.props.servicesFeed).map(this.renderService);
      return dom.div({ className: 'ServicesList' }, elements);
    },

    renderService: function(service) {
      var wasDiscontinued = this.wasDiscontinued(service);
      var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
      var momentStarted = moment.utc(service.date_started);
      var providedByEducatorName = service.provided_by_educator_name;

      return dom.div({
        key: service.id,
        style: merge(styles.service, {
          background: serviceColor(service.service_type_id),
          opacity: (wasDiscontinued) ? 0.8 : 1
        })
      },
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            dom.div({ style: { fontWeight: 'bold' } }, serviceText),
            this.renderEducatorName(providedByEducatorName),
            this.renderDateStarted(service),          // When did the service start?
            this.renderTimeSinceStarted(service)      // How long has it been going?
          ),
          this.renderDiscontinuedInformation(service)
        ),
        dom.div({ style: merge(styles.userText, { paddingTop: 15 }) }, service.comment)
      );
    },

    renderDateStarted: function (service) {
      var momentStarted = moment.utc(service.date_started);
      var startedToday = moment().utc().subtract(1, 'day') < momentStarted;

      // For services added today, return "Started today" instead of the date:
      if (startedToday) return dom.div({}, 'Started today');

      // For services started earlier than today, show the date started:
      return dom.div({}, 'Started ', momentStarted.format('MMMM D, YYYY'));
    },

    renderTimeSinceStarted: function (service) {
      var wasDiscontinued = this.wasDiscontinued(service);
      var momentStarted = moment.utc(service.date_started);

      if (wasDiscontinued) {
        // For discontinued services, display the length of time between start and discontinue dates
        return dom.div({},
          moment.utc(service.discontinued_recorded_at).from(moment.utc(service.date_started), true)
        );
      } else {
        var startedToday = moment().utc().subtract(1, 'day') < momentStarted;

        // Don't show how long service has been going if it was added today
        if (startedToday) return null;

        // Show how long the service has been going
        return dom.div({}, moment.utc(service.date_started).fromNow(true));
      };
    },

    renderEducatorName: function (educatorName) {
      if (educatorName !== "" && educatorName !== null) {
        return dom.div({}, 'With ' + educatorName);
      };
    },

    renderDiscontinuedInformation: function(service) {
      var discontinuedAt = moment.utc(service.discontinued_recorded_at);
      var now = moment();

      if (discontinuedAt > now) {
        var description = 'Ending';
      } else {
        var description = 'Ended';
      };

      if (this.wasDiscontinued(service)) {
        return dom.div({},
          dom.div({}, description),
          dom.div({}, discontinuedAt.format('MMMM D, YYYY'))
        );
      }

      return this.renderDiscontinueButton(service)
    },

    // Toggles when in confirmation state
    renderDiscontinueButton: function(service) {
      var isConfirming = (this.state.discontinuingServiceId === service.id);
      var isHovering = (this.state.hoveringDiscontinueServiceId === service.id);
      var isPending = (this.props.discontinueServiceRequests[service.id] === 'pending');

      var buttonText = (isPending)
        ? 'Updating...'
        : (isConfirming) ? 'Confirm' : 'Discontinue';
      var style = (isConfirming || isPending) ?
        styles.discontinueConfirm
        : (isHovering) ? {} : styles.discontinue;

      var discontinueButton = dom.button({
        className: 'btn',
        onMouseEnter: this.onMouseEnterDiscontinue.bind(this, service.id),
        onMouseLeave: this.onMouseLeaveDiscontinue,
        style: style,
        onClick: this.onClickDiscontinueService.bind(this, service.id)
      }, buttonText);

      var cancelButton = (isConfirming) ? this.renderCancelDiscontinueButton(service) : null;
      return dom.div({}, discontinueButton, cancelButton);
    },

    renderCancelDiscontinueButton: function(service) {
      var isHovering = (this.state.hoveringCancelServiceId === service.id);
      var style = (isHovering) ? {} : styles.cancel;

      return dom.button({
        className: 'btn',
        onMouseEnter: this.onMouseEnterCancel.bind(this, service.id),
        onMouseLeave: this.onMouseLeaveCancel,
        style: merge(style, { marginLeft: 5 }),
        onClick: this.onClickCancelDiscontinue.bind(this, service.id)
      }, 'Cancel');
    }
  });
})();
