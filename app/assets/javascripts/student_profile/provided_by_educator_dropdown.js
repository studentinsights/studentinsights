(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;

  var ProvidedByEducatorDropdown = window.shared.ProvidedByEducatorDropdown = React.createClass({
    displayName: 'ProvidedByEducatorDropdown',

    propTypes: {
      educatorsIndex: React.PropTypes.object.isRequired,
    },

    educatorNames: function() {
      var educatorsIndex = this.props.educatorsIndex;
      var educatorIds = Object.keys(educatorsIndex);

      return educatorIds.map(function(educatorId) {
        return educatorsIndex[educatorId].full_name;
      });
    },

    render: function () {
      return dom.input({
        className: 'ProvidedByEducatorDropdown',
        style: {
          marginTop: 2,
          fontSize: 14,
          padding: 4,
          width: '50%'
        }
      });
    },

    componentDidMount: function() {
      $(ReactDOM.findDOMNode(this)).autocomplete({ source: this.educatorNames() });
    },

    componentWillUnmount: function() {
      $(ReactDOM.findDOMNode(this)).autocomplete('destroy');
    }

  });

})();
