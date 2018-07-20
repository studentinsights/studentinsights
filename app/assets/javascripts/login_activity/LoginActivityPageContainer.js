import React from 'react';
import LoginActivityPage from './LoginActivityPage';

export default class LoginActivityPageContainer extends React.Component {

  render() {
    const nowTimestamp = moment().unix();
    const thirtyDaysAgoTimestamp = moment().subtract(30, 'days').unix();

    return (
      <LoginActivityPage
        queryStartTimestamp={thirtyDaysAgoTimestamp}
        queryEndTimestamp={nowTimestamp}
      />
    );
  }

}