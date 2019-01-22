import React from 'react';
import PropTypes from 'prop-types';
import * as Routes from '../helpers/Routes';

const whitePixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// Pure UI component for displaying a student photo
export default class StudentPhoto extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingFailed: false
    };
    
    this.onError = this.onError.bind(this);
  }

  altText() {
    const {student} = this.props;
    return `Student photo for ${student.first_name} ${student.last_name}`;
  }

  onError(e) {
    this.setState({loadingFailed: true});
    e.target.src = null;
  }

  render() {
    const {student, height, width, alt, style} = this.props;
    const {loadingFailed} = this.state;
    if (loadingFailed) return this.renderFallback();

    return (
      <img
        style={style}
        src={Routes.studentPhoto(student.id)}
        width={width}
        height={height}
        alt={alt !== undefined ? alt : this.altText()}
        onError={this.onError}
      />
    );
  }

  renderFallback() {
    const {fallbackEl, height, width, alt, style} = this.props;
    if (fallbackEl) return fallbackEl;

    return (
      <img
        style={style}
        src={whitePixel}
        width={width}
        height={height}
        alt={alt !== undefined ? alt : this.altText()}
      />
    );
  }
}

StudentPhoto.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired
  }).isRequired,
  fallbackEl: PropTypes.node,
  alt: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  style: PropTypes.object,
};

