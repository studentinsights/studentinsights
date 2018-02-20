import React from 'react';

class ServiceTypesControlPanel extends React.Component {

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
          </div>
        </div>
        <div style={panelOuterStyles}>
          <div style={panelInnerStyles}>
            <h1>Service Types</h1>
          </div>
        </div>
      </div>
    );
  }

}

export default ServiceTypesControlPanel;
