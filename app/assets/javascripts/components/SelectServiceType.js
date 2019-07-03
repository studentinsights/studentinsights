import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';


// For selecting a service type (eg, Reading Intervention)
export default function SelectServiceType({serviceTypeId, onChange, serviceTypes, style = undefined}) {
  const sortedServiceTypes = _.sortBy(serviceTypes, 'name');
  const options = [{value: ALL, label: 'All'}].concat(sortedServiceTypes.map(serviceType => {
    return { value: serviceType.id, label: serviceType.name };
  }));

  // SimpleFilterSelect always expects text
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="Service..."
      value={serviceTypeId.toString()}
      onChange={value => onChange(value === ALL ? ALL : parseInt(value, 10))}
      options={options} />
  );
}
SelectServiceType.propTypes = {
  serviceTypeId: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  serviceTypes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  style: PropTypes.object
};