import _ from 'lodash';

(function() {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;

  const serviceColor = window.shared.serviceColor;
  const moment = window.moment;

  const styles = {
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
  window.shared.ServicesList = React.createClass({
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

    // Confirmation step
    onClickDiscontinueService: function(serviceId) {
      if (this.state.discontinuingServiceId !== serviceId) {
        this.setState(merge(this.getInitialState(), {
          discontinuingServiceId: serviceId,
        }));
        return;
      }

      this.props.onClickDiscontinueService(serviceId);
      this.setState(this.getInitialState());
      window.location.reload();
    },

    onClickCancelDiscontinue: function(serviceId) {
      this.setState(this.getInitialState());
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

    render: function() {
      const elements = (this.props.servicesFeed.active.length === 0 && this.props.servicesFeed.discontinued.length === 0)
        ? <div style={styles.noItems}>
        No services
      </div>
        : this.sortedMergedServices(this.props.servicesFeed).map(this.renderService);
      return (
        <div className="ServicesList">
          {elements}
        </div>
      );
    },

    renderService: function(service) {
      const wasDiscontinued = this.wasDiscontinued(service);
      const serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
      const providedByEducatorName = service.provided_by_educator_name;

      return (
        <div
          key={service.id}
          style={merge(styles.service, {
            background: serviceColor(service.service_type_id),
            opacity: (wasDiscontinued) ? 0.8 : 1
          })}>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>
                {serviceText}
              </div>
              {this.renderEducatorName(providedByEducatorName)}
              {// When did the service start?
              this.renderDateStarted(service)}
              {// When will the service end?
              this.renderEstimatedEndDate(service)}
              {// How long has it been going?
              this.renderTimeSinceStarted(service)}
            </div>
            {this.renderDiscontinuedInformation(service)}
          </div>
          <div style={merge(styles.userText, { paddingTop: 15 })}>
            {service.comment}
          </div>
        </div>
      );
    },

    renderDateStarted: function (service) {
      const momentStarted = moment.utc(service.date_started);
      // const startedToday = moment().utc().subtract(1, 'day');

      // For services added today, return "Started today" instead of the date:
      // if (momentStarted > startedToday ) return (
      //   <div>
      //     Started today
      //   </div>
      // );

      // For services started earlier than today, show the date started:
      return (
        <div>
          {'Started '}
          {momentStarted.format('MMMM D, YYYY')}
        </div>
      );
    },

    renderEstimatedEndDate: function (service) {
      const momentEnded = moment.utc(service.estimated_end_date);

      // If estimated end date exist then show ui:
      if (momentEnded.isValid()) return (
        <div>
          {'Scheduled to End '}
          {momentEnded.format('MMMM D, YYYY')}
        </div>
      );
    },

    renderTimeSinceStarted: function (service) {
      const wasDiscontinued = this.wasDiscontinued(service);
      const momentStarted = moment.utc(service.date_started);

      if (wasDiscontinued) {
        // For discontinued services, display the length of time between start and discontinue dates
        return (
          <div>
            {moment.utc(service.discontinued_recorded_at).from(moment.utc(service.date_started), true)}
          </div>
        );
      } else {
        const startedToday = moment().utc().subtract(1, 'day') < momentStarted;

        // Don't show how long service has been going if it was added today
        if (startedToday) return null;

        // Show how long the service has been going
        return (
          <div>
            {moment.utc(service.date_started).fromNow(true)}
          </div>
        );
      }
    },

    renderEducatorName: function (educatorName) {
      if (educatorName !== "" && educatorName !== null) {
        return (
          <div>
            {'With ' + educatorName}
          </div>
        );
      }
    },

    renderDiscontinuedInformation: function(service) {
      const discontinuedAt = moment.utc(service.discontinued_recorded_at);
      const now = moment();

      const description = (discontinuedAt > now)
        ? 'Ending'
        : 'Ended';

      if (this.wasDiscontinued(service)) {
        return (
          <div>
            <div>
              {description}
            </div>
            <div>
              {discontinuedAt.format('MMMM D, YYYY')}
            </div>
          </div>
        );
      }

      return this.renderDiscontinueButton(service);
    },

    // Toggles when in confirmation state
    renderDiscontinueButton: function(service) {
      const isConfirming = (this.state.discontinuingServiceId === service.id);
      const isHovering = (this.state.hoveringDiscontinueServiceId === service.id);
      const isPending = (this.props.discontinueServiceRequests[service.id] === 'pending');

      const buttonText = (isPending)
        ? 'Updating...'
        : (isConfirming) ? 'Confirm' : 'Discontinue Early';

      const style = (isConfirming || isPending) ?
        styles.discontinueConfirm
        : (isHovering) ? {} : styles.discontinue;

      const discontinueButton = <button
        className="btn"
        onMouseEnter={this.onMouseEnterDiscontinue.bind(this, service.id)}
        onMouseLeave={this.onMouseLeaveDiscontinue}
        style={style}
        onClick={this.onClickDiscontinueService.bind(this, service.id)}>
        {buttonText}
      </button>;

      const cancelButton = (isConfirming) ? this.renderCancelDiscontinueButton(service) : null;
      return (
        <div>
          {discontinueButton}
          {cancelButton}
        </div>
      );
    },

    renderCancelDiscontinueButton: function(service) {
      const isHovering = (this.state.hoveringCancelServiceId === service.id);
      const style = (isHovering) ? {} : styles.cancel;

      return (
        <button
          className="btn"
          onMouseEnter={this.onMouseEnterCancel.bind(this, service.id)}
          onMouseLeave={this.onMouseLeaveCancel}
          style={merge(style, { marginLeft: 5 })}
          onClick={this.onClickCancelDiscontinue.bind(this, service.id)}>
          Cancel
        </button>
      );
    }
  });
})();
