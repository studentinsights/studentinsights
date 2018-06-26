import React from 'react';
import PropTypes from 'prop-types';
import * as Routes from '../helpers/Routes';

const whitePixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Pure UI component for displaying a student photo
export default class StudentPhoto extends React.Component {

  altText() {
    const {student} = this.props;
    return `Student photo for ${student.first_name} ${student.last_name}`;
  }

  onError(e) {
    e.target.src = whitePixel;
  }

  render() {
    const {student, height, style} = this.props;

    return (
      <img id='student-photo'
           style={style}
           src={Routes.studentPhoto(student.id)}
           height={height}
           alt={this.altText()}
           onError={this.onError}
        />
    );
  }
}

StudentPhoto.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
};

