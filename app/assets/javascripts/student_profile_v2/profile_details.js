(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var ProfileDetails = window.shared.ProfileDetails = React.createClass({
    displayName: 'ProfileDetails',

    propTypes: {
        student: React.PropTypes.object,
        chartData: React.PropTypes.object,
        attendanceData: React.PropTypes.object
    },

    getEvents: function(){
      // Returns a list of {type: ..., date: ..., value: ...} pairs, sorted by date of occurrence.
      var name = this.props.student.first_name;
      var events = [];

      _.each(this.props.attendanceData.tardies, function(obj){
        events.push({
          message: name + ' was tardy.', date: Date.parse(obj.occurred_at)
        });
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({
          message: name + ' was absent.', date: Date.parse(obj.occurred_at)
        });
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        var score = quad[3];
        events.push({
          message: name + ' scored a ' + score + ' on the ELA section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        var score = quad[3];
        events.push({
          message: name + ' scored a ' + score + ' on the Math section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        var score = quad[3];
        events.push({
          message: name + ' scored a ' + score + '% on the Reading section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        var score = quad[3];
        events.push({
          message: name + ' scored a ' + score + '% on the Math section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      // TODO: incorporate discipline incidents.
      return _.sortBy(events, 'date').reverse();
    },

    render: function() {
      return dom.div({},
        dom.ul({},
          this.getEvents().map(function(obj){
            var key = [obj.date, obj.message].join();
            return dom.li({ key: key },
              moment(obj.date).format("MMMM Do, YYYY") + ": " + obj.message
            );
          })
        )
      );
    }
  });
})();