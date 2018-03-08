import React from 'react';
import GenericLoader from '../components/GenericLoader';


/*
Showing info about an educator.
*/
class EducatorPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchEducator = this.fetchEducator.bind(this);
    this.renderEducator = this.renderEducator.bind(this);
  }

  fetchEducator() {
    const url = `/educators/${educatorId}.json`;
    return fetch(url, { credentials: 'include' })
      .then(response => response.json());
  }

  render() {
    return (
      <div className="EducatorPage">
        <GenericLoader
          promiseFn={this.fetchEducator}
          render={this.renderEducator} />
      </div>
    );
  }

  renderEducator(educator) {
    return (
      <div>
        <pre>{JSON.stringify(educator, null, 2)}</pre>
      </div>
    );
  }
}

export default EducatorPage;