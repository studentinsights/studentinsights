(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var FeedHelpers = window.shared.FeedHelpers;
  var QuadConverter = window.shared.QuadConverter;

  var styles = {
    feedCard: {
      marginBottom: 10,
      borderRadius: 10,
      fontSize: 14
    },
    feedCardHeader: {
      fontSize: 17,
      fontWeight: 400,
      color: '#555555'
    },
    title: {
      borderBottom: '1px solid #333',
      color: 'black',
      padding: 10,
      paddingLeft: 0,
      marginBottom: 10
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
          message: name + ' was tardy.',
          date: Date.parse(obj.occurred_at)
        });
      });
      _.each(this.props.attendanceData.absences, function(obj){
        events.push({
          type: 'Tardy',
          message: name + ' was absent.',
          date: Date.parse(obj.occurred_at)
        });
      });
      _.each(this.props.attendanceData.discipline_incidents, function(obj){
        events.push({
          type: 'Incident',
          message: obj.incident_description + ' in the ' + obj.incident_location,
          date: Date.parse(obj.occurred_at)
        });
      });
      _.each(this.props.chartData.mcas_series_ela_scaled, function(quad){
        var score = quad[3];
        events.push({
          type: 'MCAS ELA',
          message: name + ' scored a ' + score + ' on the ELA section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.mcas_series_math_scaled, function(quad){
        var score = quad[3];
        events.push({
          type: 'MCAS Math',
          message: name + ' scored a ' + score + ' on the Math section of the MCAS.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_reading_percentile, function(quad){
        var score = quad[3];
        events.push({
          type: 'STAR Reading',
          message: name + ' scored in the ' + score + 'th percentile on the Reading section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.chartData.star_series_math_percentile, function(quad){
        var score = quad[3];
        events.push({
          type: 'STAR Math',
          message: name + ' scored in the ' + score + 'th percentile on the Math section of STAR.',
          date: QuadConverter.toDate(quad)
        });
      });
      _.each(this.props.feed.deprecated.interventions, function(obj){
        events.push({
          type: 'Note',
          message: obj.name + '(Goal: ' + obj.goal + ')',
          date: moment(obj.start_date_timestamp, "YYYY-MM-DD").toDate()
        });
      });
      _.each(this.props.feed.deprecated.notes, function(obj){
        events.push({
          type: 'Note',
          message: obj.content,
          date: moment(obj.created_at_timestamp).toDate()
        });
      });
      _.each(this.props.feed.event_notes, function(obj){
        events.push({
          type: 'Note',
          message: obj.text,
          date: moment(obj.updated_at).toDate() // TODO: should we care more about created vs updated?
        });
      });
      _.each(this.props.feed.services, function(obj){
        events.push({
          type: 'Service',
          message: obj.id,
          date: moment(obj.updated_at).toDate() // TODO: should we care more about created vs updated?
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
      return dom.div({}, this.getEvents().map(this.renderCard));
    },

    renderCard: function(event){
      var key = [event.date, event.message].join();
      if (event.type === 'Absence' || event.type === 'Tardy'){
        var containingDivStyle = {};
        var headerDivStyle = {fontSize: 14};
        var paddingStyle = {paddingLeft: 10};
        var text = '';
      } else {
        var containingDivStyle = {border: '1px solid #eee'};
        var headerDivStyle = {};
        var paddingStyle = {padding: 10};
        var text = event.message;
      }

      var type_to_color = {
        "Absence": '#e8fce8',
        "Tardy": '#e8fce8',
        "Incident": '#e8fce8',
        "Note": '#e8fce8',
        "Service": '#e8fce8',

        "MCAS ELA": '#ffe7d6',
        "STAR Reading": '#ffe7d6',

        "MCAS Math": '#e8e9fc',
        "STAR Math": '#e8e9fc'
      }

      return dom.div(
        {key: key, style: merge(styles.feedCard, containingDivStyle)},
        dom.div({style: paddingStyle}, // Provides padding inside card.
          dom.div({style: merge(styles.feedCardHeader, headerDivStyle)}, // Header (date + badge)
            moment(event.date).format("MMMM Do, YYYY:"),
            dom.span( // Brightly-colored badge
              {style: merge(styles.badge, {background: type_to_color[event.type]})},
              event.type
            )
          ),
        text
        )
      );
    }
  });
})();