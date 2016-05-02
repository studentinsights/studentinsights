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
      postMessage: React.PropTypes.string,
      sparkline: React.PropTypes.element.isRequired
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          dom.span({ style: styles.value }, (this.props.value === undefined) ? 'none' : this.props.value),
          dom.span({ style: styles.caption }, (this.props.postMessage === undefined) ? '' : " " + this.props.postMessage)
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
      attendanceEvents: React.PropTypes.array.isRequired
    },

    renderTrendArrow: function(caption, diff){
      var arrowSpanStyle = {display: 'inline', marginLeft: 5};

      if (diff > 0){
        // Bad thing going up is bad == red.
        var text = "⬆";
        var titleText = caption + " are higher than they were this time last week.";
        arrowSpanStyle.color = "red";
      } else if (diff == 0){
        var text = "--";
        var titleText = caption + " are the same as they were this time last week.";
        arrowSpanStyle.color = "purple";
      } else {
        // Bad thing going down is good == green.
        var text = "⬇";
        var titleText = caption + " are lower than they were this time last week.";
        arrowSpanStyle.color = "green";
      }

      return dom.span({style: arrowSpanStyle, title: titleText}, text);
    },

    toSchoolYear: function(now){
      // Takes in a Moment object, returns the year starting the school year into which it falls.
      var d = now;
      if (d.month() < 8){
        // The school year starts on August 1st.
        // So if the month is before August, it falls in the previous year.
        return d.year() - 1;
      } else {
        return d.year();
      }
    },

    startOfSchoolYear: function(now){
      // Takes in a moment object and returns Aug 31st at the beginning of that school year.
      return moment.utc().year(this.toSchoolYear(now)).month(8 - 1).date(31);
    },

    renderValueAndTrendArrow: function(attendanceEvents, caption){
      var now = moment.utc();

      var startOfThisSchoolYear = this.startOfSchoolYear(moment.utc());
      var thisSchoolYearSoFar = _.filter(attendanceEvents, function(event){
        return moment(event.occurred_at).isBetween(startOfThisSchoolYear, now)
      }).length;

      var startOfThisWeek = moment.utc().startOf('week');
      var startOfLastWeek = startOfThisWeek.clone().subtract(1, 'week');
      var oneWeekAgo = moment.utc().subtract(1, 'week');
      var thisWeekSoFar = _.filter(attendanceEvents, function(event){
        return moment(event.occurred_at).isBetween(startOfThisWeek, now);
      }).length;
      var lastWeekSoFar = _.filter(attendanceEvents, function(event){
        return moment(event.occurred_at).isBetween(startOfLastWeek, oneWeekAgo);
      }).length;

      var weekToWeekChange = thisWeekSoFar - lastWeekSoFar;

      return dom.span({ style: styles.value }, thisSchoolYearSoFar,
        this.renderTrendArrow(this.props.caption, weekToWeekChange)
      );
    },

    render: function() {
      return dom.div({ className: 'AcademicSummary' },
        dom.div({ style: styles.textContainer },
          dom.span({ style: styles.caption }, this.props.caption + ':'),
          this.renderValueAndTrendArrow(this.props.attendanceEvents, this.props.caption)
        )
      );
    }
  });

})();
