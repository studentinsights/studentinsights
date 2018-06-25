import React from 'react';
import * as Routes from '../helpers/Routes';

const whitePixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Pure UI component for displaying a student photo
class StudentPhoto extends React.Component {

  onError(e) {
    e.target.src = whitePixel;
  }

  altText() {
    const {student} = this.props;
    return `Student photo for ${student.first_name} ${student.last_name}`;
  }

  render() {
    const {student, height, style} = this.props;

    return (
      <img id='student-photo'
           style={style}
           src={Routes.studentPhoto(student.id)}
           height={height}
           alt={this.altText}
           onError={this.onError}
        />
    );
  }
}

StudentPhoto.propTypes = {
  student: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,
};

