import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toSchoolYear} from '../helpers/schoolYear';
import {
  toMoment,
  toValue,
  toDate
} from './QuadConverter';
import { toMomentFromTimestamp } from '../helpers/toMoment';


export default class FullCaseHistory extends React.Component {
  getMessageForServiceType(service_type_id){
    // Given a service_type_id, returns a message suitable for human consumption describing the service.
    const {serviceTypesIndex} = this.props;

    return (serviceTypesIndex.hasOwnProperty(service_type_id))
      ? serviceTypesIndex[service_type_id].name
      : "Description not found for code: " + service_type_id;
  }

  // Returns a list of {type: ..., date: ..., value: ...} pairs, sorted by date of occurrence.
  getEvents() {
    const {
      student,
      attendanceData,
      chartData,
      feed,
      dibels
    } = this.props;
    const name = student.first_name;
    const events = [];

    _.each(attendanceData.tardies, obj => {
      events.push({
        type: 'Tardy',
        id: obj.id,
        message: name + ' was tardy.',
        date: new Date(obj.occurred_at)
      });
    });
    _.each(attendanceData.absences, obj => {
      events.push({
        type: 'Absence',
        id: obj.id,
        message: name + ' was absent.',
        date: new Date(obj.occurred_at)
      });
    });
    _.each(attendanceData.discipline_incidents, obj => {
      events.push({
        type: 'Incident',
        id: obj.id,
        message: obj.incident_description + ' in the ' + obj.incident_location,
        date: new Date(obj.occurred_at)
      });
    });
    _.each(chartData.mcas_series_ela_scaled, quad => {
      // var score = quad[3];
      events.push({
        type: 'MCAS-ELA',
        id: toMoment(quad).format("MM-DD"),
        message: name + ' scored a ' + toValue(quad) +' on the ELA section of the MCAS.',
        date: toDate(quad)
      });
    });
    _.each(chartData.mcas_series_math_scaled, quad => {
      // var score = quad[3];
      events.push({
        type: 'MCAS-Math',
        id: toMoment(quad).format("MM-DD"),
        message: name + ' scored a ' + toValue(quad) +' on the Math section of the MCAS.',
        date: toDate(quad)
      });
    });
    _.each(chartData.star_series_reading_percentile, starObject => {
      const dateTaken = toMomentFromTimestamp(starObject.date_taken);

      events.push({
        type: 'STAR-Reading',
        id: dateTaken.format(),
        message: `${name} scored in the ${starObject.percentile_rank}th percentile on the Reading section of STAR at ${dateTaken.local().format('h:mma')}.`,
        date: dateTaken.toDate()
      });
    });
    _.each(chartData.star_series_math_percentile, starObject => {
      const dateTaken = toMomentFromTimestamp(starObject.date_taken);

      events.push({
        type: 'STAR-Math',
        id: dateTaken.format(),
        message: `${name} scored in the ${starObject.percentile_rank}th percentile on the Math section of STAR at ${dateTaken.local().format('h:mma')}.`,
        date: dateTaken.toDate()
      });
    });
    _.each(feed.deprecated.interventions, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.name + '(Goal: ' + obj.goal + ')',
        date: moment(obj.start_date_timestamp, "YYYY-MM-DD").toDate()
      });
    });
    _.each(feed.deprecated.notes, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.content,
        date: moment(obj.created_at_timestamp).toDate()
      });
    });
    _.each(feed.event_notes, obj => {
      events.push({
        type: 'Note',
        id: obj.id,
        message: obj.text,
        date: moment(obj.recorded_at).toDate()
      });
    });

    const services = feed.services.active.concat(feed.services.discontinued);
    _.each(services, obj => {
      events.push({
        type: 'Service',
        id: obj.id,
        message: this.getMessageForServiceType(obj.service_type_id),
        date: moment(obj.date_started).toDate()
      });
    });

    _.each(dibels, obj => {
      const cleanedDate = obj.date_taken.split('T')[0];
      const parsedDate = moment.utc(cleanedDate, 'YYYY-MM-DD').toDate();

      events.push({
        type: 'DIBELS',
        id: obj.id,
        message: `${name} scored ${obj.benchmark} in DIBELS.`,
        date: parsedDate
      });
    });
    return _.sortBy(events, 'date').reverse();
  }

  render(){
    const {showTitle} = this.props;
    const bySchoolYearDescending = _.toArray(
      _.groupBy(this.getEvents(), event => toSchoolYear(event.date))
    ).reverse();

    return (
      <div className="FullCaseHistory" style={styles.root}>
        {showTitle && (
          <div className="ServicesHeader" style={styles.fullCaseHistoryHeading}>
            <h4 style={styles.fullCaseHistoryTitle}>Full Case History</h4>}
          </div>
        )}
        {bySchoolYearDescending.map(this.renderCardsForYear, this)}
      </div>
    );
  }

  renderCardsForYear(eventsForYear){
    // Grab what school year we're in from any object in the list.
    const year = toSchoolYear(eventsForYear[0].date);
    // Computes '2016 - 2017 School Year' for input 2016, etc.
    const schoolYearString = year.toString() + ' - ' + (year+1).toString() + ' School Year';

    const key = 'school-year-starting-' + year;
    return (
      <div style={styles.box} key={key} id={key}>
        <h4 style={styles.schoolYearTitle}>
          {schoolYearString}
        </h4>
        {eventsForYear.map(this.renderCard, this)}
      </div>
    );
  }

  renderCard(event){
    const key = [event.type, event.id].join("-");

    let containingDivStyle;
    let headerDivStyle;
    let paddingStyle;
    let text;

    if (event.type === 'Absence' || event.type === 'Tardy'){
      // These event types are less important, so make them smaller and no description text.
      containingDivStyle = styles.feedCard;
      headerDivStyle = {...styles.feedCardHeader, fontSize: 14};
      paddingStyle = {paddingLeft: 10};
      text = '';
    } else {
      containingDivStyle = {...styles.feedCard, border: '1px solid #eee'};
      headerDivStyle = styles.feedCardHeader;
      paddingStyle = {padding: 10};
      text = event.message;
    }

    const dateStyle = {display: 'inline-block', width: 180};

    const badgeStyle = {...styles.badge, background: this.renderColorForEventType(event.type)};

    return (
      <div key={key} id={key} style={containingDivStyle}>
        <div style={paddingStyle}>
          <div style={headerDivStyle}>
            <span style={dateStyle}>
              {this.renderEventDate(event.date)}
            </span>
            <span style={badgeStyle}>
              {event.type.replace("-", " ")}
            </span>
          </div>
          {text}
        </div>
      </div>
    );
  }

  renderColorForEventType(eventType) {
    return {
      "Absence": '#e8fce8',
      "Tardy": '#e8fce8',
      "Incident": '#e8fce8',
      "Note": '#e8fce8',
      "Service": '#e8fce8',

      "MCAS-ELA": '#ffe7d6',
      "STAR-Reading": '#ffe7d6',

      "MCAS-Math": '#e8e9fc',
      "STAR-Math": '#e8e9fc',

      "DIBELS": '#e8fce8'
    }[eventType];
  }

  renderEventDate(event_date){
    // Use UTC to avoid timezone-related display errors. (See GitHub issue #622.)
    // Timezone is irrelevant for this UI. We are not displaying times, only dates.
    return moment(event_date).utc().format("MMMM Do, YYYY:");
  }
}
FullCaseHistory.propTypes = {
  showTitle: PropTypes.bool,
  student: PropTypes.object,
  feed: PropTypes.object,
  dibels: PropTypes.array,
  chartData: PropTypes.object,
  attendanceData: PropTypes.object,
  serviceTypesIndex: PropTypes.object
};

const styles = {
  root: {
    fontSize: 14,
  },
  feedCard: {
    marginBottom: 10,
    borderRadius: 10,
  },
  feedCardHeader: {
    fontWeight: 400,
    color: '#555555'
  },
  box: {
    border: '1px solid #ccc',
    padding: 15,
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  schoolYearTitle: {
    padding: 10,
    paddingLeft: 10,
    marginBottom: 10,
    color: '#555555'
  },
  badge: {
    display: 'inline-block',
    width: '10em',
    textAlign: 'center',
    marginLeft: 10,
    marginRight: 10
  },
  fullCaseHistoryTitle: {
    color: 'black',
    display: 'inline-block',
    flex: 'auto',
  },
  fullCaseHistoryHeading: {
    display: 'flex',
    borderBottom: '1px solid #333',
    padding: 10,
    paddingLeft: 0,
  }
};
