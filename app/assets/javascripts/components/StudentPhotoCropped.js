import React from 'react';
import PropTypes from 'prop-types';
import * as Routes from '../helpers/Routes';
import {enhancedStudentPhotoStyles} from '../helpers/PerDistrict';


// Pure UI component for displaying a student photo, cropped to be
// smaller and zoomed-in to student's face.
// See also <StudentPhoto />
export default class StudentPhotoCropped extends React.Component {
  render() {
    const {districtKey} = this.context;
    const {studentId, photoUrl, style = {}} = this.props;
    const perDistrictStyles = enhancedStudentPhotoStyles(districtKey);

    // Allow fetching from a different URL for parallel endpoint
    // with different authorizations in class lists.
    const url = photoUrl ? photoUrl : Routes.studentPhoto(studentId);

    return (
      <div
        className="StudentPhotoCropped"
        style={{
          width: 58,
          height: 58,
          marginRight: 10,
          border: '1px solid #ddd',
          borderRadius: 3,
          backgroundColor: '#ddd',
          backgroundImage: `url(${url})`,
          overflow: 'hidden',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
          ...perDistrictStyles,
          ...style
        }}></div>
    );
  }
}
StudentPhotoCropped.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
StudentPhotoCropped.propTypes = {
  studentId: PropTypes.number.isRequired,
  photoUrl: PropTypes.string.isRequired,
  style: PropTypes.object,
};
