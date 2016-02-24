(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;
  var ReactSelect = window.Select;
  var datepickerOptions = window.datepicker_options;

  var styles = {
    dialog: {
      border: '1px solid #ccc',
      borderRadius: 2,
      padding: 20,
      marginBottom: 20,
      marginTop: 10
    },
    // date: {
    //   paddingRight: 10,
    //   fontWeight: 'bold',
    //   display: 'inline-block'
    // },
    // educator: {
    //   paddingLeft: 5,
    //   display: 'inline-block'
    // },
    // textarea: {
    //   fontSize: 14,
    //   border: '1px solid #eee',
    //   width: '100%' //overriding strange global CSS, should cleanup
    // },
    cancelRecordServiceButton: { // overidding CSS
      color: 'black',
      background: '#eee',
      marginLeft: 10,
      marginRight: 10
    },
    serviceButton: {
      background: '#eee', // override CSS
      color: 'black',
      // shrinking:
      width: '12em',
      fontSize: 12,
      padding: 8
    }
  };


  /*
  Pure UI form for recording that a student is receiving a service.
  Tracks its own local state and submits values to prop callbacks.
  */
  var RecordService = window.shared.RecordService = React.createClass({
    propTypes: {
      studentFirstName: React.PropTypes.string.isRequired,
      onSave: React.PropTypes.func.isRequired,
      onCancel: React.PropTypes.func.isRequired,
      requestState: PropTypes.nullable(React.PropTypes.string.isRequired),

      // context
      nowMoment: React.PropTypes.object.isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      educatorsIndex: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        serviceTypeId: null,
        providedByEducatorId: null,
        dateStarted: null
      }
    },

    componentDidMount: function(props, state) {
      var el = ReactDOM.findDOMNode(this);
      $(el).find('.datepicker').datepicker(datepickerOptions);
    },

    onClickNoteType: function(noteTypeId, event) {
      this.setState({ eventNoteTypeId: noteTypeId });
    },

    onClickCancel: function(event) {
      this.props.onCancel();
    },

    onClickSave: function(event) {
      var params = _.pick(this.state, 'eventNoteTypeId', 'text');
      this.props.onSave(params);
    },

    onServiceClicked: function(serviceTypeId, event) {
      this.setState({ serviceTypeId: serviceTypeId });
    },

    render: function() {
      return dom.div({ className: 'RecordService', style: styles.dialog },
        dom.div({ style: { marginBottom: 5 } }, 'Which service?'),
        dom.div({ style: { display: 'flex' } },
          dom.div({ style: { flex: 1 } },
            this.renderServiceButton(29),
            this.renderServiceButton(30)
          ),
          dom.div({ style: { flex: 1 } },
            this.renderServiceButton(41),
            this.renderServiceButton(32)
          ),
          dom.div({ style: { flex: 'auto' } },
            this.renderServiceButton(21),
            this.renderServiceButton(22),
            this.renderServiceButton(23)
          )
        ),
        dom.div({ style: { marginTop: 20 } },
          dom.div({}, 'Who is working with ' + this.props.studentFirstName + '?'),
          dom.div({ style: { width: '50%' } }, this.renderEducatorSelect())
          // dom.span({ style: { fontSize: 12, color: '#666', marginLeft: 5, marginRight: 5 } }, ' starting on '),
          // dom.input({ style: { fontSize: 14 }, defaultValue: moment.utc().format('MM/DD/YYYY') })
        ),
        dom.div({ style: { marginTop: 20 } }, 'When did they start?'),
        dom.input({ className: 'datepicker', style: { fontSize: 14, padding: 5, width: '50%' }, defaultValue: moment.utc().format('MM/DD/YYYY') }),


        dom.div({ style: { marginTop: 15 } },
          dom.button({
            style: {
              marginTop: 20,
              background: (this.state.serviceTypeId === null) ? '#ccc' : undefined
            },
            disabled: (this.state.serviceTypeId === null),
            className: 'btn save',
            onClick: this.onClickSave
          }, 'Record service'),
          dom.button({
            className: 'btn cancel',
            style: styles.cancelRecordServiceButton,
            onClick: this.onClickCancel
          }, 'Cancel'),
          (this.props.requestState === 'pending') ? dom.span({}, 'Saving...') : null,
          (this.props.requestState === 'error') ? dom.span({}, 'Try again!') : null
        )
      );
    },

    renderServiceButton: function(serviceTypeId, options) {
      var serviceNameMap = {
        29: 'Counseling, in-house',
        30: 'Counseling, outside',
        41: 'Reading intervention',
        32: 'Math intervention'
      };
      var serviceType = this.props.serviceTypesIndex[serviceTypeId];
      // TODO(kr) update default value here after merging server-side migrations
      var serviceText = serviceNameMap[serviceTypeId] || 'Unknown service';
      var color = this.serviceColor(serviceTypeId);

      return dom.button({
        onClick: this.onServiceClicked.bind(this, serviceTypeId),
        tabIndex: -1,
        style: merge(styles.serviceButton, {
          background: color,
          opacity: (this.state.serviceTypeId === null || this.state.serviceTypeId === serviceTypeId) ? 1 : 0.25,
          outline: 0,
          border: (this.state.serviceTypeId === serviceTypeId)
            ? '4px solid rgba(49, 119, 201, 0.75)'
            : '4px solid white'
        }),
        className: 'btn'
      }, serviceText);
    },

    serviceColor: function(serviceTypeId) {
      var map = {
       40: '#ffe7d6',
       41: '#ffe7d6',
       21: '#e8fce8',
       22: '#e8fce8',
       23: '#e8fce8',
       24: '#e8fce8',
       29: '#eee',
       30: '#eee',
       32: '#e8e9fc'
      };
      return map[serviceTypeId] || null;
    },

    // TODO(kr) Factor out?
    renderEducatorSelect: function() {
      var options = _.values(this.props.educatorsIndex).map(function(educator) {
        var name = (educator.full_name !== null)
          ? educator.full_name
          : educator.email.split('@')[0];
        return { value: educator.id, label: name };
      });

      return createEl(ReactSelect, {
        name: 'assigned-educator-select',
        clearable: false,
        placeholder: 'Type name..',
        value: this.state.serviceProvidedByEducatorId,
        options: options,
        onChange: this.onAssignedEducatorChanged
      });
    }
  });
})();