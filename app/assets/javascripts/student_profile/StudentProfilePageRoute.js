import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import GenericLoader from '../components/GenericLoader';
import PageContainer from './PageContainer';


// React entrypoint for student profile v3 page
export default class StudentProfilePageRoute extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const {studentId} = this.props;
    const url = `/api/students/${studentId}/profile_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="StudentProfilePageRoute" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchJson}
          style={styles.flexVertical}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {districtKey, nowFn} = this.context;
    const {queryParams, history} = this.props;
    return (
      <PageContainer
        shouldUseLightProfilePage={true}
        districtKey={districtKey}
        nowMomentFn={nowFn}
        serializedData={json}
        queryParams={queryParams}
        history={history} />
    );
  }
}
StudentProfilePageRoute.propTypes = {
  studentId: PropTypes.number.isRequired,
  queryParams: PropTypes.object.isRequired,
  history: PropTypes.shape({
    pushState: PropTypes.func.isRequired,
    replaceState: PropTypes.func.isRequired.isRequired
  }).isRequired
};
StudentProfilePageRoute.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};