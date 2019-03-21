import React from 'react';
import PropTypes from 'prop-types';
import * as Routes from '../helpers/Routes';

// Pure UI component for displaying a student photo, cropped to be
// smaller and zoomed-in to student's face.
// See also <StudentPhoto />
export default function StudentPhotoCropped({studentId, style = {}}) {
  return (
    <div
      style={{
        backgroundSize: 'cover',
        width: 58,
        height: 58,
        marginRight: 5,
        border: '1px solid #eee',
        borderRadius: 3,
        backgroundPosition: 'center top',
        overflow: 'hidden',
        backgroundImage: `url(${Routes.studentPhoto(studentId)})`,
        ...style
      }}></div>
  );
}
StudentPhotoCropped.propTypes = {
  studentId: PropTypes.number.isRequired,
  style: PropTypes.object,
};
