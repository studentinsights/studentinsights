(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;

  var ProvidedByEducatorDropdown = window.shared.ProvidedByEducatorDropdown = React.createClass({
    displayName: 'ProvidedByEducatorDropdown',

    propTypes: {
      educatorsForServicesDropdown: React.PropTypes.array.isRequired,
      onUserTyping: React.PropTypes.func.isRequired,
      onUserDropdownSelect: React.PropTypes.func.isRequired,
    },

    render: function () {
      return dom.div({},
        this.renderInput(),
        this.renderDropdownToggle()
      )
    },

    renderInput: function () {
      return dom.input({
        className: 'ProvidedByEducatorDropdown',
        onChange: this.props.onUserTyping,
        placeholder: 'Last Name, First Name...',
        style: {
          marginTop: 2,
          fontSize: 14,
          padding: 4,
          width: '50%'
        }
      });
    },

    renderDropdownToggle: function () {
      return dom.a({
        onClick: this.toggleOpenMenu,
        style: {
          position: 'relative',
          right: 20,
          fontSize: 10,
          color: '#4d4d4d'
        }
      }, String.fromCharCode('0x25BC'));
    },

    toggleOpenMenu: function () {
      $('.ProvidedByEducatorDropdown').autocomplete("search", "");
    },

    componentDidMount: function() {
      var self = this;
      $('.ProvidedByEducatorDropdown').autocomplete({
        source: this.props.educatorsForServicesDropdown,
        delay: 0,
        minLength: 0,
        select: function(event, ui) {
          self.props.onUserDropdownSelect(ui.item.value);
        }
      });
    },

    componentWillUnmount: function() {
      $('.ProvidedByEducatorDropdown').autocomplete('destroy');
    }

  });

})();
