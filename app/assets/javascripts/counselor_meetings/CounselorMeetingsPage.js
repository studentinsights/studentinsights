import React from 'react';
import PropTypes from 'prop-types';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader, {flexVerticalStyle} from '../components/GenericLoader';
import CounselorMeetingsView from './CounselorMeetingsView';


// A page for counselors to track meetings with students
export default class CounselorMeetingsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchStudents() {
    const url = `/api/counselor_meetings/meetings_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="CounselorMeetingsPage" style={flexVerticalStyle}>
        <GenericLoader
          promiseFn={this.fetchStudents}
          style={flexVerticalStyle}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const {currentEducatorId} = this.props;
    return (
      <CounselorMeetingsView
        currentEducatorId={currentEducatorId}
        educatorsIndex={json.educators_index}
        students={json.students}
        meetings={json.meetings}
      />
    );
  }
}
CounselorMeetingsPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired
};
