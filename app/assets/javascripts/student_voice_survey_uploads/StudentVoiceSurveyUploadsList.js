import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import formatBytes from '../helpers/formatBytes';
import * as Routes from '../helpers/Routes';
import Educator from '../components/Educator';
import tableStyles from '../components/tableStyles';
import HelpBubble, {modalFromRight, modalFromRightWithVerticalScroll} from '../components/HelpBubble';


// Shows a list of uploads of student voice surveys.
export default class StudentVoiceSurveyUploadsList extends React.Component {
  render() {
    const {style} = this.props;
    return (
      <div className="StudentVoiceSurveyUploadsList" style={{...styles.flexVertical, ...style}}>
        {this.renderTable()}
      </div>
    );
  }

  renderTable() {
    const {studentVoiceSurveyUploads} = this.props;
    const sortedUploads = _.sortBy(studentVoiceSurveyUploads, upload => {
      return -1* toMomentFromTimestamp(upload.created_at).unix();
    });

    if (sortedUploads.length === 0) {
      return <div>There are no uploads.</div>;
    }
    return (
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.headerCell}>Uploaded on</th>
            <th style={tableStyles.headerCell}>Uploaded by</th>
            <th style={tableStyles.headerCell}>File name</th>
            <th style={tableStyles.headerCell}>File size</th>
            <th style={tableStyles.headerCell}>Digest</th>
            <th style={tableStyles.headerCell}>Students</th>
            <th style={tableStyles.headerCell}>Status</th>
          </tr>
        </thead>
        <tbody>{sortedUploads.map(upload => (
          <tr key={upload.id}>
            <td style={tableStyles.cell}>
              {toMomentFromTimestamp(upload.created_at).local().format("M/D/YY h:mma")}
            </td>
            <td style={tableStyles.cell}>
              <Educator educator={upload.uploaded_by_educator} />
            </td>
            <td style={tableStyles.cell}>{upload.file_name}</td>
            <td style={{...tableStyles.cell, textAlign: 'right'}}>{formatBytes(upload.file_size)}</td>
            <td style={tableStyles.cell} title={upload.file_digest}>
              {upload.file_digest.slice(0, 8)}
            </td>
            <td style={tableStyles.cell}>
              {this.renderStudents(upload)}
            </td>
            <td style={tableStyles.cell}>
              {this.renderStats(upload)}
            </td>
          </tr>
        ))}</tbody>
      </table>
    );
  }

  renderStudents(upload) {
    const {students} = upload;

    return (
      <HelpBubble
        modalStyle={modalFromRightWithVerticalScroll}
        style={{display: 'block', textAlign: 'center', marginLeft: 0}}
        linkStyle={{fontSize: 14}}
        teaser={upload.students.length}
        title={`Students for ${upload.file_digest.slice(0, 8)}:${upload.id}`}
        content={
          <div>{students.map(student => (
            <a key={student.id} href={Routes.studentProfile(student.id)} target="_blank">
              {student.last_name}, {student.first_name}
            </a>
          ))}</div>
        }
      />
    );
  }

  renderStats(upload) {
    const {stats} = upload;
    return (
      <HelpBubble
        modalStyle={modalFromRight}
        style={{marginLeft: 0}}
        linkStyle={{fontSize: 14}}
        teaser="stats"
        title={`Stats for ${upload.file_digest.slice(0, 8)}:${upload.id}`}
        content={<pre>{JSON.stringify(stats, null, 2)}</pre>}
      />
    );
  }
}
StudentVoiceSurveyUploadsList.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  studentVoiceSurveyUploads: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    file_name: PropTypes.string.isRequired,
    file_size: PropTypes.number.isRequired,
    file_digest: PropTypes.string.isRequired,
    stats: PropTypes.object.isRequired,
    completed: PropTypes.bool.isRequired,
    created_at: PropTypes.string.isRequired,
    students: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string
    })).isRequired,
    uploaded_by_educator: PropTypes.shape({
      id: PropTypes.number.isRequired,
      full_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired
    }).isRequired
  })).isRequired,
  style: PropTypes.object
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};