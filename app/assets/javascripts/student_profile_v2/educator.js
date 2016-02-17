(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var PropTypes = window.shared.PropTypes;

  /*
  Canonical display of an educator, showing their name as a link to email them.
  */
  var Educator = window.shared.Educator = React.createClass({
    displayName: 'Educator',

    propTypes: {
      educator: React.PropTypes.shape({
        full_name: PropTypes.nullable(React.PropTypes.string.isRequired),
        email: React.PropTypes.string.isRequired
      }).isRequired
    },

    // Turns SIS format (Curtatone, Joe) -> Joe Curtatone
    educatorName: function(educator) {
      if (educator.full_name === null) return educator.email.split('@')[0] + '@';
      var parts = educator.full_name.split(', ');
      return parts[1] + ' ' + parts[0];
    },

    render: function() {
      var educator = this.props.educator;
      var educatorName = this.educatorName(educator);
      return dom.a({
        className: 'Educator',
        href: 'mailto:' + educator.email
      }, educatorName);
    }
  });
})();