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
    const {studentId, style = {}} = this.props;
    const perDistrictStyles = enhancedStudentPhotoStyles(districtKey);
    return (
      <div
        className="StudentPhotoCropped"
        style={{
          width: 58,
          height: 58,
          marginRight: 10,
          border: '1px solid #aaa',
          borderRadius: 3,
          backgroundColor: '#ccc',
          backgroundImage: `url(${Routes.studentPhoto(studentId)})`,
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
  style: PropTypes.object,
};
