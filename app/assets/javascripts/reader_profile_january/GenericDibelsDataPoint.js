import React from 'react';
import PropTypes from 'prop-types';

export default class GenericDibelsDataPoint extends React.Component {
  render() {
    const {dataPoint} = this.props;    
    return <div>{dataPoint.json.value}</div>;
  }
}
GenericDibelsDataPoint.propTypes = {
  dataPoint: PropTypes.object.isRequired
};
