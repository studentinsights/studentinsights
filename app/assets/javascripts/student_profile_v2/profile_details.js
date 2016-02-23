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
      var events = [];

      _.each(this.props.attendanceData.tardies, function(obj){
        events.push({type: 'Tardy', date: Date.parse(obj.occurred_at), data: null});
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({type: 'Absence', date: Date.parse(obj.occurred_at), data: null});
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({type: 'MCAS ELA Score', date: new Date(year, month, day), data: score});
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({type: 'MCAS Math Score', date: new Date(year, month, day), data: score});
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({type: 'STAR Reading Percentile', date: new Date(year, month, day), data: score});
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        var year = quad[0], month = quad[1], day = quad[2], score = quad[3];
        events.push({type: 'STAR Math Percentile', date: new Date(year, month, day), data: score});
      });
      // var discipline_incidents = this.props.attendanceData.discipline_incidents;

      return _.sortBy(events, 'date').reverse();
    },
    getDescription: function(obj){
      var name = this.props.student.first_name;
      if (obj.type === 'Tardy'){
        return name + ' was tardy.'
      }
      else if (obj.type === 'Absence'){
        return name + ' was absent.'
      }
      else if (obj.type === 'MCAS ELA Score'){
        return name + ' scored a ' + obj.data.toString() + ' on the ELA section of the MCAS.' 
      }
      else if (obj.type === 'MCAS Math Score'){
        return name + ' scored a ' + obj.data.toString() + ' on the Math section of the MCAS.' 
      }
      else if (obj.type === 'STAR Reading Percentile'){
        return name + ' scored a ' + obj.data.toString() + '% on the Reading section of STAR.' 
      }
      else if (obj.type === 'STAR Math Percentile'){
        return name + ' scored a ' + obj.data.toString() + '% on the Math section of STAR.' 
      }
    },

    render: function() {
      var self = this;
      return dom.div({},
        createEl("ul", null,
          this.getEvents().map(function(obj){
            return createEl("li", null,
              moment(obj.date).format("MMMM Do, YYYY") + ": " + self.getDescription(obj)
            );
          })
        )
      );
    }
  });
})();