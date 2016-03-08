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
          message: name + ' was tardy.', date: Date.parse(obj.occurred_at),
          color: '#e8fce8'
        });
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({
          message: name + ' was absent.', date: Date.parse(obj.occurred_at),
          color: '#e8fce8'
        });
      });
      _.each(this.props.attendanceData.discipline_incidents, function(obj){
        events.push({
          message: obj.incident_description + ' in the ' + obj.incident_location,
          date: Date.parse(obj.occurred_at),
          color: '#e8fce8'
        });
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({
          message: name + ' scored a ' + score + ' on the ELA section of the MCAS.',
          date: new Date(year, month, day),
          color: '#ffe7d6'
        });
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({
          message: name + ' scored a ' + score + ' on the Math section of the MCAS.',
          date: new Date(year, month, day),
          color: '#e8e9fc'
        });
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({
          message: name + ' scored in the ' + score + 'th percentile on the Reading section of STAR.',
          date: new Date(year, month, day),
          color: '#ffe7d6'
        });
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({
          message: name + ' scored in the ' + score + 'th percentile on the Math section of STAR.',
          date: new Date(year, month, day),
          color: '#e8e9fc'
        });
      });
      return _.sortBy(events, 'date').reverse();
    },

    render: function() {
      return dom.div({},
        this.getEvents().map(function(obj){
          var key = [obj.date, obj.message].join();
          return dom.div({ key: key, style: {backgroundColor: obj.color, marginBottom: '10px', borderRadius: '10px'}},
            dom.div({ style: {padding: '10px'}},
              dom.p({}, moment(obj.date).format("MMMM Do, YYYY") + ":"),
              obj.message
            )
          );
        })
      );
    }
  });
})();