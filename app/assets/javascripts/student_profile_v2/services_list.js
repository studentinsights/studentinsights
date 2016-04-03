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
      services: React.PropTypes.array.isRequired,
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
    sortFn: function(service) {
      return [this.wasDiscontinued(service) ? false : true, service.date_started];
    },

    render: function() {
      var elements = (this.props.services.length === 0)
        ? dom.div({ style: styles.noItems }, 'No services')
        : _.sortBy(this.props.services, this.sortFn).reverse().map(this.renderService);
      return dom.div({ className: 'ServicesList' }, elements);
    },

    renderService: function(service) {
      var wasDiscontinued = this.wasDiscontinued(service);
      var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
      var momentStarted = moment.utc(service.date_started);
      var educator = this.props.educatorsIndex[service.provided_by_educator_id];

      return dom.div({
        key: service.id,
        style: merge(styles.service, {
          background: serviceColor(service.service_type_id),
          opacity: (wasDiscontinued) ? 0.25 : 1
        })
      },
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            dom.div({ style: { fontWeight: 'bold' } }, serviceText),
            dom.div({},
              'With ',
              createEl(Educator, { educator: educator })
            ),
            dom.div({},
              'Since ',
              momentStarted.format('MMMM D, YYYY')
            ),
            dom.div({}, (wasDiscontinued)
              ? moment.utc(service.discontinued_recorded_at).from(moment.utc(service.date_started), true)
              : moment.utc(service.date_started).fromNow(true))
          ),
          this.renderDiscontinuedInformation(service)
        ),
        dom.div({ style: merge(styles.userText, { paddingTop: 15 }) }, service.comment)
      );
    },

    renderDiscontinuedInformation: function(service) {
      if (this.wasDiscontinued(service)) {
        return dom.div({},
          dom.div({}, 'Discontinued'),
          dom.div({}, moment.utc(service.discontinued_recorded_at).format('MMMM D, YYYY'))
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