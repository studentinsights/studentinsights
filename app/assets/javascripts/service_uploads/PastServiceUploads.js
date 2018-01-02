import React from 'react';

class PastServiceUploads extends React.Component {

  render() {
    return null;
  }

}

PastServiceUploads.propTypes = {
  serviceUploads: React.PropTypes.array.isRequired,
  onClickDeleteServiceUpload: React.PropTypes.func.isRequired,
};

export default PastServiceUploads;
