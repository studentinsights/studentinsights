(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var Educator = window.shared.Educator = React.createClass({
    displayName: 'Educator',
    
    propTypes: {
      educatorsIndex: React.PropTypes.object.isRequired,
      educatorId: React.PropTypes.number.isRequired
    },

    render: function() {
      var educator = this.props.educatorsIndex[this.props.educatorId];
      var educatorName = (educator.full_name !== null)
        ? educator.full_name
        : educator.email.split('@')[0] + '@';
      return dom.a({ href: 'mailto:' + educator.email }, educatorName);
    }
  });
})();