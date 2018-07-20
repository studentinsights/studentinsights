import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';
import moment from 'moment';
import _ from 'lodash';
import {toMomentFromTime} from '../helpers/toMoment';
import SectionHeading from '../components/SectionHeading';

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
    const emails = Object.keys(structuredData);
    const pastThirtyDaysArray = this.pastThirtyDaysArray();

    return (
      <div style={style.wrapper}>
        <SectionHeading>Login Activity, Past 30 days</SectionHeading>
        <div style={style.container}>
          {this.renderHeaderRow()}
          {emails.map((email) => {
            return this.renderRow(email, structuredData[email], pastThirtyDaysArray)
          })}
        </div>
      </div>
    );
  }

  renderHeaderRow() {
    const pastThirtyDaysArray = this.pastThirtyDaysArray();

    return (
      <div style={style.row}>
        <div style={{...style.emailCell, ...{display: 'inline-block'}}}>
        </div>
        {pastThirtyDaysArray.map((day) => {
          return (
            <div style={{...style.squareCell, ...style.cell, ...style.headerDateCell}}>
              {moment(day).utc().format('D/M')}
            </div>
          );
        })}
      </div>
    );
  }

  renderRow(email, loginData, pastThirtyDaysArray) {
    const truncatedEmail = email.substring(0, 35);
    return (
      <div style={style.row}>
        <div style={{...style.cell, ...style.emailCell}}>
          {truncatedEmail || 'No email entered'}
        </div>
        {pastThirtyDaysArray.map((day) => {
          return (loginData[day])
            ? this.renderCell(email, loginData[day], day)
            : this.renderEmptyCell()
        })}
      </div>
    );
  }

  renderCell(email, data, day) {
    return (
      <div style={{...style.cell, ...style.squareCell}} className='tooltip'>
        {this.renderTooltipText(email, data, day)}
        {this.renderSuccessLoginSegment(data.success || 0)}
        {this.renderFailLoginSegment(data.fail || 0)}
      </div>
    )
  }

  renderTooltipText(email, data, day) {
    return (
      <span className="tooltiptext">
        <div>{email.split('@')[0]}, {moment(day).utc().format('D/M')}:</div>
        <br/>
        <div>{`${data.success || 0} successful logins.`}</div>
        <div>{`${data.fail || 0} failed attempts.`}</div>
      </span>
    );
  }

  renderSuccessLoginSegment(count) {
    const baseHex = '#329fff';
    const divStyle = {
      ...style.cellSegment, ...{backgroundColor: baseHex, opacity: count / 10},
    };

    return (
      <div style={divStyle}>
      </div>
    );
  }

  renderFailLoginSegment(count) {
    const baseHex = '#CD6000';
    const divStyle = {
      ...style.cellSegment, ...{backgroundColor: baseHex, opacity: count / 10},
    };

    return (
      <div style={divStyle}>
      </div>
    );
  }

  renderEmptyCell() {
    return (<div style={{...style.cell, ...style.squareCell}}></div>)
  }
}

const style = {
  wrapper: {
    padding: '20px 40px',
  },
  container: {
    marginTop: 20,
    marginLeft: 10,
    minWidth: 1060,
  },
  row: {
    clear: 'both',
  },
  headerDateCell: {
    transform: 'rotate(-45deg)',
    border: 'none',
    fontSize: 12,
  },
  cell: {
    height: 25,
    border: '1px solid #ccc',
    margin: '-1px 0 0 -1px',
    float: 'left',
    display: 'flex',
  },
  cellSegment: {
    flex: 1,
  },
  emailCell: {
    float: 'left',
    padding: 2,
    width: 340,
  },
  squareCell: {
    width: 25,
    float: 'left',
  },
};

