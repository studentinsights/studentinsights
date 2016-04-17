(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;

  var ProvidedByEducatorDropdown = window.shared.ProvidedByEducatorDropdown = React.createClass({
    displayName: 'ProvidedByEducatorDropdown',

    propTypes: {
      educatorsForServicesDropdown: React.PropTypes.array.isRequired,
      onChange: React.PropTypes.func.isRequired,
    },

    render: function () {
      return dom.input({
        className: 'ProvidedByEducatorDropdown',
        onChange: this.props.onChange,
        style: {
          marginTop: 2,
          fontSize: 14,
          padding: 4,
          width: '50%'
        }
      });
    },

    componentDidMount: function() {
      $(ReactDOM.findDOMNode(this)).autocomplete({ source: this.props.educatorsForServicesDropdown });
    },

    componentWillUnmount: function() {
      $(ReactDOM.findDOMNode(this)).autocomplete('destroy');
    }

  });

})();
