(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var Datepicker = window.shared.Datepicker;

  var ServiceTypeDropdown = window.shared.ServiceTypeDropdown = React.createClass({

    propTypes: {
      onUserTypingServiceType: React.PropTypes.func.isRequired,
      onUserSelectServiceType: React.PropTypes.func.isRequired,
    },

    render: function () {
      return dom.div({},
        dom.div({ style: { marginTop: 20 } }, 'Service Type'),
        dom.input({
          style: {
            fontSize: 14,
            padding: 5,
            width: '50%'
          },
          ref: 'ServiceTypeDropdown',
          onChange: this.props.onUserTypingServiceType
        }),
        dom.a({
          style: {
            position: 'relative',
            right: 20,
            fontSize: 10,
            color: '#4d4d4d'
          },
          onClick: this.toggleOpenMenu
        }, String.fromCharCode('0x25BC'))
      );
    },

    componentDidMount: function() {
      var self = this;

      $(this.refs.ServiceTypeDropdown).autocomplete({
        source: '/service_types/',
        delay: 0,
        minLength: 0,
        autoFocus: true,

        select: function(event, ui) {
          self.props.onUserSelectServiceType(ui.item.value);
        },

      });
    },

    toggleOpenMenu: function () {
      $(this.refs.ServiceTypeDropdown).autocomplete('search', '');
    },

  });

})();

