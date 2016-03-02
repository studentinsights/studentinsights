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
      paddingLeft: 10,
      display: 'inline-block'
    },
    discontinue: {
      background: 'white',
      opacity: 0.5,
      border: '1px solid #ccc',
      color: '#666'
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
      educatorsIndex: React.PropTypes.object.isRequired
    },

    render: function() {
      var elements = (this.props.services.length === 0)
        ? dom.div({ style: styles.noItems }, 'No services')
        : _.sortBy(this.props.services, 'date_started').reverse().map(this.renderService);
      return dom.div({ className: 'ServicesList' }, elements);
    },

    // TODO(kr) allow editing, fixup.  'no longer active'
    // TODO(kr) for now, going with ignoring older data we could interpret to be here,
    // for end-user simplicity.  Start with fresh data.
    renderService: function(service) {
      var serviceText = this.props.serviceTypesIndex[service.service_type_id].name;
      var momentStarted = moment.utc(service.date_started);
      var educator = this.props.educatorsIndex[service.provided_by_educator_id];
      return dom.div({
        key: service.id,
        style: merge(styles.service, { background: serviceColor(service.service_type_id) })
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
              momentStarted.format('MMMM D, YYYY'),
              dom.span({ style: styles.daysAgo }, momentStarted.fromNow(true))
            )
          )
          // TODO(kr) re-enable
          // dom.div({},
          //   dom.button({ className: 'btn', style: styles.discontinue }, 'Discontinue')
          // )
        ),
        dom.div({ style: merge(styles.userText, { paddingTop: 15 }) }, service.comment)
      );
    }
  });
})();