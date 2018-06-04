import PropTypes from 'prop-types';
import React from 'react';
import ServiceUploadDetail from './ServiceUploadDetail';

class PastServiceUploads extends React.Component {

  render() {
    const { serviceUploads } = this.props;

    if (serviceUploads === null) return this.renderSpinner();

    return this.renderUploads();
  }

  renderUploads() {
    const { serviceUploads, onClickDeleteServiceUpload } = this.props;

    return (
      <div>
        {serviceUploads.map((serviceUpload) => {
          return (
            <ServiceUploadDetail
              data={serviceUpload}
              onClickDeleteServiceUpload={onClickDeleteServiceUpload}
              key={String(serviceUpload.id)} />
          );
        }, this)}
      </div>
    );
  }

  renderSpinner() {
    return (
      <div className="loader">Loading...</div>
    );
  }

}

PastServiceUploads.propTypes = {
  serviceUploads: PropTypes.array,  /* show loading spinner if null */
  onClickDeleteServiceUpload: PropTypes.func.isRequired,
};

export default PastServiceUploads;
