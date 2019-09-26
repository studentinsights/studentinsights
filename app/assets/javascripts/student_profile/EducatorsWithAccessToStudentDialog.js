import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {apiFetchJson} from '../helpers/apiFetchJson';
import Educator from '../components/Educator';
import GenericLoader from '../components/GenericLoader';


// Fetchers data and shows list of which educators have access to the student.
export default class EducatorsWithAccessToStudentDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowingList: false
    };
    this.fetchJson = this.fetchJson.bind(this);
    this.onShowClicked = this.onShowClicked.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const {studentId} = this.props;
    const url = `/api/students/${studentId}/educators_with_access_json`;
    return apiFetchJson(url);
  }

  onShowClicked(e) {
    e.preventDefault();
    this.setState({isShowingList: true});
  }

  render() {
    return (
      <div className="EducatorsWithAccessToStudentDialog">
        <GenericLoader
          promiseFn={this.fetchJson}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const withAccess = json.with_access_json;
    const countsByReason = _.countBy(withAccess, d => d.reason);
    const sortedReasons = [
      'districtwide',
      'housemaster',
      'schoolwide',
      'grade_level',
      'section',
      'homeroom'
    ];
    const sortedWithAccess = _.orderBy(withAccess, ({educator, reason}) => {
      return [sortedReasons.indexOf(reason), educator.full_name];
    });
    return (
      <div style={{fontSize: 14}}>
        <div>
          {sortedReasons.map(reason => {
            const count = countsByReason[reason] || 0;
            if (count === 0) return null;
            return (
              <div
                key={reason}
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  marginRight: 5,
                  marginBottom: 5,
                  padding: 10,
                  border: '1px solid #eee',
                  background: '#f8f8f8'
                }}
              >
                <div style={{fontWeight: 'bold', marginBottom: 5}}>{reason}</div>
                <div>{countsByReason[reason]}</div>
              </div>
            );
          })}
        </div>
        <div style={{marginTop: 20}}>
          {this.renderList(sortedWithAccess)}
        </div>
      </div>
    );
  }

  renderList(sortedWithAccess) {
    const {isShowingList} = this.state;
    if (!isShowingList) return <a onClick={this.onShowClicked} href="#">Show list of educators</a>;

    return (
      <div>
        {sortedWithAccess.map(({educator, reason}) => {
          return (
            <div key={educator.id} style={{display: 'flex'}}>
              <Educator educator={educator} /> <span style={{marginLeft: 5}}>{reason}</span>
            </div>
          );
        })}
      </div>
    );
  }
}
EducatorsWithAccessToStudentDialog.propTypes = {
  studentId: PropTypes.number.isRequired
};
