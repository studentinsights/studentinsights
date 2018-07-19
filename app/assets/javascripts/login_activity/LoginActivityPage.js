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
    this.renderCell = this.renderCell.bind(this);
    this.renderEmptyCell = this.renderEmptyCell.bind(this);
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
        return activity.created_at.startOf('day').format();
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
      return moment.utc().subtract(index, 'days').startOf('day').format();
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
    const pastThirtyDaysArray = this.pastThirtyDaysArray();
    const emails = Object.keys(structuredData);

    return (
      <div style={style.container}>
        {emails.map((email) => {
          return this.renderRow(email, structuredData[email], pastThirtyDaysArray)
        })}
      </div>
    );
  }

  renderRow(email, loginData, pastThirtyDaysArray) {
    const truncatedEmail = email.substring(0, 35);

    return (
      <div style={style.row}>
        <div style={{...style.cell, ...style.emailCell}}>
          {truncatedEmail}
        </div>
        {pastThirtyDaysArray.map((day) => {
          const data = loginData[day];

          return (data)
            ? this.renderCell(data)
            : this.renderEmptyCell()
        })}
      </div>
    );
  }

  renderCell(data) {
    return (
      <div style={{...style.cell, ...style.squareCell}}>
        {this.renderSuccessLoginSegment(data.success)}
        {this.renderFailLoginSegment(data.fail)}
      </div>
    )
  }

  renderSuccessLoginSegment(count) {
    const successHex = '#000099';
    const divStyle = {
      ...style.cellSegment,
      ...{backgroundColor: successHex},
      ...{opacity: count / 10}
    };

    return (
      <div style={divStyle}></div>
    );
  }

  renderFailLoginSegment(count) {
    const failHex = '#CD6000';
    const divStyle = {
      ...style.cellSegment,
      ...{backgroundColor: failHex},
      ...{opacity: count / 10}
    };

    return (
      <div style={divStyle}></div>
    );
  }

  renderEmptyCell() {
    return (<div style={{...style.cell, ...style.squareCell}}></div>)
  }
}

const failCountToHex = {

};

const successCountToHex = {

};

const style = {
  row: {
    clear: 'both'
  },
  lastRow: {
    borderBottom: '1px solid #ccc'
  },
  cell: {
    height: 25,
    borderTop: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    float: 'left',
    display: 'flex',
  },
  cellSegment: {
    flex: 1,
  },
  emailCell: {
    padding: 2,
    width: 340,
  },
  squareCell: {
    width: 25,
    float: 'left',
  },
  container: {
    marginTop: 50,
    marginLeft: 25,
  }
};

