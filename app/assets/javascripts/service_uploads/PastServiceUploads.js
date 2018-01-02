import React from 'react';

class PastServiceUploads extends React.Component {

  render() {
    const { serviceUploads } = this.props;

    if (serviceUploads === null) return this.renderSpinner();

    return null;
  }

  renderSpinner() {
    return (
      <div className="loader">Loading...</div>
    );
  }

}

PastServiceUploads.propTypes = {
  serviceUploads: React.PropTypes.array.isRequired,
  onClickDeleteServiceUpload: React.PropTypes.func.isRequired,
};

export default PastServiceUploads;
