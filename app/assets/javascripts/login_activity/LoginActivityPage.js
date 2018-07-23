import React from 'react';
import PropTypes from 'prop-types';
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
    this.renderCellForDay = this.renderCellForDay.bind(this);
    this.renderEmptyCellForDay = this.renderEmptyCellForDay.bind(this);
    this.renderSuccessfulLoginListItem = this.renderSuccessfulLoginListItem.bind(this);
    this.renderFailedAttemptListItem = this.renderFailedAttemptListItem.bind(this);
  }

  fetchLoginActivities() {
    const {queryStartTimestamp, queryEndTimestamp} = this.props;

    const endpoint = '/api/login_activity';
    const params = `?created_at_or_before=${queryEndTimestamp}&created_after=${queryStartTimestamp}`;
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
        return activity.created_at.clone().startOf('day').format();
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
        <SectionHeading>Login Attempts, Past 30 days</SectionHeading>
        <div style={style.container}>
          {this.renderHeaderRow()}
          {emails.map((email, index) => {
            return this.renderRow(email, index, structuredData[email], pastThirtyDaysArray);
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
        {pastThirtyDaysArray.map((day, index) => {
          return (
            <div key={index} style={{...style.squareCell, ...style.cell, ...style.headerDateCell}}>
              {moment(day).utc().format('D/M')}
            </div>
          );
        })}
      </div>
    );
  }

  renderRow(email, index, loginData, pastThirtyDaysArray) {
    const emailDisplay = (email === 'null') /* null cast to string by _.groupBy */
      ? 'No email (often means user timed out)'
      : email.substring(0, 35);

    return (
      <div style={style.row} key={index}>
        <div style={{...style.cell, ...style.emailCell}}>{emailDisplay}</div>
        {pastThirtyDaysArray.map((day, index) => {
          return (loginData[day])
            ? this.renderCellForDay(email, index, loginData[day], day)
            : this.renderEmptyCellForDay(index);
        })}
      </div>
    );
  }

  renderCellForDay(email, index, data, day) {
    /*
    We're using lodash 3.10.1, so this uses 3.10.1 syntax for _.filter.
    The most up-to-date syntax is different.
    See https://lodash.com/docs/3.10.1#filter.
    */
    const successfulAttempts = _.filter(data, 'success', true);
    const failedAttempts = _.filter(data, 'success', false);

    return (
      <div key={index}
           style={{...style.cell, ...style.squareCell}}
           className='tooltip'>
        {this.renderTooltipText(email, successfulAttempts, failedAttempts, day)}
        {this.renderSuccessLoginSegment(successfulAttempts)}
        {this.renderFailLoginSegment(failedAttempts)}
      </div>
    );
  }

  renderTooltipText(email, successfulAttempts, failedAttempts, day) {
    const emailDisplay = (email === 'null') /* null cast to string by _.groupBy */
      ? 'No email (often means user timed out)'
      : email.split('@')[0];

    return (
      <span className="tooltiptext">
        <div>{emailDisplay}, {moment(day).utc().format('D/M')}</div>
        {this.renderSuccessfulLoginList(successfulAttempts)}
        {this.renderFailedAttemptList(failedAttempts)}
      </span>
    );
  }

  renderSuccessfulLoginList(successfulAttempts) {
    if (successfulAttempts.length === 0) return null;

    return (
      <div>
        <br/><div>Successful login activity:</div>
        {successfulAttempts.map((item, index) => {
          return this.renderSuccessfulLoginListItem(item, index);
        }, this)}
      </div>
    );
  }

  renderFailedAttemptList(failedAttempts) {
    if (failedAttempts.length === 0) return null;

    return (
      <div>
        <br/><div>Failed login activity:</div>
        {failedAttempts.map((item, index) => {
          return this.renderFailedAttemptListItem(item, index);
        }, this)}
      </div>
    );
  }

  renderSuccessfulLoginListItem (item, index) {
    return (
      <li key={index}>
        {item.created_at.local().format('h:mm A')}
      </li>
    );
  }

  renderFailedAttemptListItem (item, index) {
    return (
      <li key={index}>
        {item.created_at.local().format('h:mm A')} – {item.failure_reason}
      </li>
    );
  }

  renderSuccessLoginSegment(successfulAttempts) {
    const count = successfulAttempts.length;
    const baseHex = '#329fff';
    const divStyle = {
      ...style.cellSegment, ...{backgroundColor: baseHex, opacity: count / 10},
    };

    return (
      <div style={divStyle}>
      </div>
    );
  }

  renderFailLoginSegment(failedAttempts) {
    const count = failedAttempts.length;
    const baseHex = '#CD6000';
    const divStyle = {
      ...style.cellSegment, ...{backgroundColor: baseHex, opacity: count / 10},
    };

    return (
      <div style={divStyle}>
      </div>
    );
  }

  renderEmptyCellForDay(index) {
    return (<div key={index} style={{...style.cell, ...style.squareCell}}></div>);
  }
}

LoginActivityPage.propTypes = {
  queryStartTimestamp: PropTypes.string.isRequired,
  queryEndTimestamp: PropTypes.string.isRequired,
};

const style = {
  wrapper: {
    padding: '20px 40px',
  },
  container: {
    marginTop: 50,
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

