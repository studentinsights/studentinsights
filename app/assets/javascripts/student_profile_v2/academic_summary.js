(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var SharedPropTypes = window.shared.ReactHelpers.SharedPropTypes;

  var AcademicSummary = window.shared.AcademicSummary = React.createClass({
    displayName: 'AcademicSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: SharedPropTypes.nullable(React.PropTypes.number.isRequired),
      sparkline: React.PropTypes.element.isRequired
    },

    // TODO(kr) statics?
    styles: {
      caption: {
        marginRight: 5
      },
      value: {
        fontWeight: 'bold'
      }
    },

    render: function() {
      var styles = this.styles;
      return dom.div({ className: 'AcademicSummary' },
        dom.span({ style: styles.caption }, this.props.caption + ':'),
        dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value),
        dom.div({}, this.props.sparkline)
      );
    }
  });
})();