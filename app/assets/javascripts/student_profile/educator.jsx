(function() {
  window.shared || (window.shared = {});
  const dom = window.shared.ReactHelpers.dom;
  const createEl = window.shared.ReactHelpers.createEl;
  const merge = window.shared.ReactHelpers.merge;

  const PropTypes = window.shared.PropTypes;

  /*
  Canonical display of an educator, showing their name as a link to email them.
  */
  const Educator = window.shared.Educator = React.createClass({
    displayName: 'Educator',

    propTypes: {
      educator: React.PropTypes.shape({
        full_name: React.PropTypes.string, // or null
        email: React.PropTypes.string.isRequired
      }).isRequired
    },

    // Turns SIS format (Watson, Joe) -> Joe Watson
    educatorName: function(educator) {
      if (educator.full_name === null) return educator.email.split('@')[0] + '@';
      const parts = educator.full_name.split(', ');
      return parts[1] + ' ' + parts[0];
    },

    render: function() {
      const educator = this.props.educator;
      const educatorName = this.educatorName(educator);
      return (
        <a className="Educator" href={'mailto:' + educator.email}>
          {educatorName}
        </a>
      );
    }
  });
})();