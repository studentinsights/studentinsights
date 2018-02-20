import React from 'react';

class ServiceTypesControlPanel extends React.Component {

  renderServiceTypeDetail(serviceType) {
    const boxStyle = {
      marginTop: 10,
      padding: 10,
      fontFamily: "'Open Sans', sans-serif",
      border: '1px solid #ccc'
    };

    const titleStyle = {
      fontSize: 16
    };

    return (
      <div style={boxStyle}>
        <div style={titleStyle}>{serviceType.name}</div>
      </div>
    );
  }

  renderServiceTypes() {
    const {serializedData} = this.props;
    const {serviceTypes} = serializedData;

    return serviceTypes.map(this.renderServiceTypeDetail);
  }

  renderNewServiceType() {
    return (
      <div>
        <div style={{marginTop: 20}}>
          Name
        </div>
        <input style={{fontSize: 18}} />
        <div style={{marginTop: 20}}>
          Educators can record in Student Profile?
        </div>
        <div>
          <input type="radio" name="can_record_in_student_profile" /> Yes
        </div>
        <div>
          <input type="radio" name="can_record_in_student_profile" /> No
        </div>
        <button className="btn" style={{fontSize: 18, marginTop: 20}}>
          Add New Service Type
        </button>
      </div>
    );
  }

  render() {
    const panelOuterStyles = {
      width: '50%',
      float: 'left',
      padding: 20,
      marginTop: 20,
    };

    const panelInnerStyles = {
      marginLeft: 80,
    };

    return (
      <div>
        <div style={panelOuterStyles}>
          <div style={panelInnerStyles}>
            <h1>New Service Type</h1>
            {this.renderNewServiceType()}
          </div>
        </div>
        <div style={panelOuterStyles}>
          <div style={panelInnerStyles}>
            <h1>Service Types</h1>
            {this.renderServiceTypes()}
          </div>
        </div>
      </div>
    );
  }

}

export default ServiceTypesControlPanel;
