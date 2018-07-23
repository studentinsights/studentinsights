import React from 'react';
import moment from 'moment';
import LoginActivityPage from './LoginActivityPage';

export default class LoginActivityPageContainer extends React.Component {

  render() {
    const nowTimestamp = moment().unix();
    const thirtyDaysAgoTimestamp = moment().subtract(30, 'days').unix();

    return (
      <LoginActivityPage
        queryStartTimestamp={String(thirtyDaysAgoTimestamp)}
        queryEndTimestamp={String(nowTimestamp)}
      />
    );
  }

}