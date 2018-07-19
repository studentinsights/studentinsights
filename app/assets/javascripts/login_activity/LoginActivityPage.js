import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import moment from 'moment';
import _ from 'lodash';
import {toMomentFromTime} from '../helpers/toMoment';

export default class LoginActivityPage extends React.Component {
  constructor(props) {
    super(props);

    this.fetchLoginActivities = this.fetchLoginActivities.bind(this);
    this.renderPage = this.renderPage.bind(this);
    this.pastThirtyDaysArray = this.pastThirtyDaysArray.bind(this);
    this.structureLoginActivityJson = this.structureLoginActivityJson.bind(this);
  }

  fetchLoginActivities() {
    const nowTimestamp = moment().unix();
    const thirtyDaysAgoTimestamp = moment().subtract(30, 'days').unix();

    const endpoint = '/api/login_activity';
    const params = `?created_at_or_before=${nowTimestamp}&created_after=${thirtyDaysAgoTimestamp}`;
    const url = endpoint + params;

    return apiFetchJson(url);
  }

  structureLoginActivityJson(loginActivityJson) {
    const toMoment = loginActivityJson.map((activity) => {
      return {...activity, ...{created_at: toMomentFromTime(activity.created_at)}};
    });

    // Group activities by email identity
    const byEmail = _.groupBy(toMoment, 'identity');

    // Iterate through each identity and group login activity by day
    _.forOwn(byEmail, (value, key, collection) => {
      collection[key] = _.groupBy(value, (activity) => {
        return activity.created_at.startOf('day');
      });
    });

    // Iterate through each day and group by success/fail
    _.forOwn(byEmail, (identityLoginsByDay, identity, collection) => {
      _.forOwn(identityLoginsByDay, (activities, day, collection) => {
        identityLoginsByDay[day] = _.countBy(activities, (activity) => {
          return activity.success ? 'success' : 'fail';
        });
      });
    });

    return byEmail;
  }

  pastThirtyDaysArray() {
    const emptyArray = new Array(30);
    emptyArray.fill(0);

    const pastThirtyDays = emptyArray.map((value, index) => {
      return moment().subtract(index, 'days');
    });

    return pastThirtyDays;
  }

  render() {
    return (
      <GenericLoader
        promiseFn={this.fetchLoginActivities}
        render={this.renderPage} />
    );
  }

  renderPage(loginActivityJson) {
    // Shape of the data:
    // {
    //   "uri@demo.studentinsights.org": {
    //     "Thu Jul 19 2018 00:00:00 GMT+0000": {
    //       "fail": 4,
    //       "success": 2
    //     }
    //   },
    //   "vivian@demo.studentinsights.org": {
    //     "Thu Jul 19 2018 00:00:00 GMT+0000": {
    //       "fail": 2,
    //       "success": 1
    //     }
    //   }
    // }

    const structuredData = this.structureLoginActivityJson(loginActivityJson);
    const emails = Object.keys(structuredData);

    return (
      <div style={style.container}>
        {emails.map(email => this.renderRow(email))}
      </div>
    );
  }

  renderRow(email) {
    const truncatedEmail = email.substring(0, 35);
    return (<div style={style.cell}>{truncatedEmail}</div>)
  }
}

const style = {
  cell: {
    borderTop: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    width: 340,
    height: 25,
    padding: 2,
  },
  square: {
    height: 25,
    length: 25,
  },
  container: {
    marginTop: 50,
    marginLeft: 25,
  }
};

