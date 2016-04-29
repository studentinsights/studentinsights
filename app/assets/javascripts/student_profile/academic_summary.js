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

  var AttendanceEventsSummary = window.shared.AttendanceEventsSummary = React.createClass({
    displayName: 'AttendanceEventsSummary',

    propTypes: {
      caption: React.PropTypes.string.isRequired,
      diff: React.PropTypes.number.isRequired,
      value: PropTypes.nullable(React.PropTypes.string.isRequired)
    },

    renderTrendArrow: function(caption){
      var arrowSpanStyle = {display: 'inline', marginLeft: 5};
      if (this.props.diff > 0){
        // Bad thing going up is bad == red.
        var text = "⬆";
        var titleText = caption + " are lower than they were this time last year.";
        arrowSpanStyle.color = "red";
      } else if (this.props.diff == 0){
        var text = "--";
        var titleText = caption + " are the same as they were this time last year.";
        arrowSpanStyle.color = "purple";
      } else {
        // Bad thing going down is good == green.
        var text = "⬇";
        var titleText = caption + " are higher than they were this time last year.";
        arrowSpanStyle.color = "green";
      }

      return dom.span({style: arrowSpanStyle, title: titleText}, text);
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.span({ style: styles.value },
            (this.props.value === undefined) ? 'none' : this.props.value,
            this.renderTrendArrow(this.props.caption)
          )
        )
      );
    }
  });

})();
