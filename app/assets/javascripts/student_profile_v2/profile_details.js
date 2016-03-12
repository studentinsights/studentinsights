(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var FeedHelpers = window.shared.FeedHelpers;
  var QuadConverter = window.shared.QuadConverter;

  var Colors = {
    math: '#e8e9fc',
    reading: '#ffe7d6',
    procedural: '#e8fce8'
  };
  var styles = {
    feedCard: {
      marginBottom: '10px',
      borderRadius: '10px',
      fontSize: '10pt'
    },
    feedCardHeader: {
      fontSize: '120%',
      fontWeight: '400',
      color: '#555555'
    },
    title: {
      borderBottom: '1px solid #333',
      color: 'black',
      padding: 10,
      paddingLeft: 0
    },
    badge: {
      display: 'inline-block',
      width: '10em',
      textAlign: 'center',
      marginLeft: 10,
      marginRight: 10
    }
  };

  var ProfileDetails = window.shared.ProfileDetails = React.createClass({
    displayName: 'ProfileDetails',

    propTypes: {
        student: React.PropTypes.object,
        feed: React.PropTypes.object,
        chartData: React.PropTypes.object,
        attendanceData: React.PropTypes.object
    },

    getEvents: function(){
      // Returns a list of {type: ..., date: ..., value: ...} pairs, sorted by date of occurrence.
      var name = this.props.student.first_name;
      var events = [];

      _.each(this.props.attendanceData.tardies, function(obj){
        events.push({
          type: 'Absence',
          compressed: true,
          message: name + ' was tardy.',
          date: Date.parse(obj.occurred_at),
          color: Colors.procedural
        });
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({
          type: 'Tardy',
          compressed: true,
          message: name + ' was absent.',
          date: Date.parse(obj.occurred_at),
          color: Colors.procedural
        });
      });
      _.each(this.props.attendanceData.discipline_incidents, function(obj){
        events.push({
          type: 'Incident',
          message: obj.incident_description + ' in the ' + obj.incident_location,
          date: Date.parse(obj.occurred_at),
          color: Colors.procedural
        });
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        var score = quad[3];
        events.push({
          type: 'MCAS ELA',
          message: name + ' scored a ' + score + ' on the ELA section of the MCAS.',
          color: Colors.reading,
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        var score = quad[3];
        events.push({
          type: 'MCAS Math',
          message: name + ' scored a ' + score + ' on the Math section of the MCAS.',
          color: Colors.math,
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        var score = quad[3];
        events.push({
          type: 'STAR Reading',
          message: name + ' scored in the ' + score + 'th percentile on the Reading section of STAR.',
          date: QuadConverter.toDate(quad),
          color: Colors.reading
        });
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        var score = quad[3];
        events.push({
          type: 'STAR Math',
          message: name + ' scored in the ' + score + 'th percentile on the Math section of STAR.',
          date: QuadConverter.toDate(quad),
          color: Colors.math
        });
      });
      _.each(this.props.feed.deprecated.interventions, function(obj){
        events.push({
          type: 'Note',
          message: _.template("<%=name%> (Goal: <%=goal%>)")(obj),
          date: moment(obj.start_date_timestamp, "YYYY-MM-DD").toDate(),
          color: Colors.procedural,
        });
      });
      _.each(this.props.feed.deprecated.notes, function(obj){
        events.push({
          type: 'Note',
          message: obj.content,
          date: moment(obj.created_at_timestamp).toDate(),
          color: Colors.procedural,
        });
      });
      return _.sortBy(events, 'date').reverse();
    },

    render: function(){
      return dom.div({},
        dom.h4({style: styles.title}, 'Full Case History'),
        this.renderCardList()
      )
    },

    renderCardList: function(){
      return dom.div({style: {marginTop: '10px'}},
        this.getEvents().map(this.renderCard)
      );
    },

    renderCard: function(event){
      var key = [event.date, event.message].join();
      return dom.div(
        {
          key: key,
          style: merge(styles.feedCard,
            event.compressed ? {fontSize: '80%'} : {border: '1px solid #eee'}
          )
        },
        dom.div(event.compressed ? {style: {paddingLeft: '10px'}} : {style: {padding: '10px'}},
        dom.div({style: styles.feedCardHeader},
          moment(event.date).format("MMMM Do, YYYY:"),
          dom.span({style: merge(styles.badge, {background: event.color})}, event.type)
        ),
        event.compressed ? '' : event.message
        )
      );
    }
  });
})();