import React from 'react';
import GenericLoader from '../components/GenericLoader';
import {apiFetchJson} from '../helpers/apiFetchJson';

export default class LoginActivityPage extends React.Component {

  fetchLoginActivities() {
    const createdAtOrBefore = 0;  // todo
    const createdAfter = 0;  // todo
    const url = `/api/login_activity?created_at_or_before=${createdAtOrBefore}&created_after=${createdAfter}`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <GenericLoader
        promiseFn={this.fetchLoginActivities}
        render={this.renderPage} />
    );
  }

  renderPage(loginActivityJson) {
    console.log('loginActivityJson', loginActivityJson);
    return null;
  }

}
