(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var PropTypes = window.shared.PropTypes;

  var styles = {
    caption: {
      marginRight: 5
    },
    value: {
      fontWeight: 'bold'
    },
    sparklineContainer: {
      paddingLeft: 15,
      paddingRight: 15
    },
    textContainer: {
      paddingBottom: 5
    }
  };

  var AcademicSummary = window.shared.AcademicSummary = React.createClass({
    displayName: 'AcademicSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: PropTypes.nullable(React.PropTypes.number.isRequired),
      sparkline: React.PropTypes.element.isRequired
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value)
        ),
        dom.div({ style: styles.sparklineContainer }, this.props.sparkline)
      );
    }
  });

  var SummaryWithoutSparkline = window.shared.SummaryWithoutSparkline = React.createClass({
    displayName: 'SummaryWithoutSparkline',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      value: PropTypes.nullable(React.PropTypes.string.isRequired)
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.br(),
          dom.br(),
          dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value)
        )
      );
    }
  });

})();
