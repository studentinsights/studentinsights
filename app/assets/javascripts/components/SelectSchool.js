import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';


// For selecting a school, returning schoolId
export default function SelectSchool({schoolId, onChange, schools, style = undefined}) {
  const sortedSchools = _.sortBy(schools, 'label');
  const options = [{value: ALL, label: 'All'}].concat(sortedSchools.map(school => {
    return { value: school.id, label: school.label };
  }));

  // SimpleFilterSelect expects text
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="School..."
      value={schoolId.toString()}
      onChange={value => onChange(value === ALL ? ALL : parseInt(value, 10))}
      options={options} />
  );
}
SelectSchool.propTypes = {
  schoolId: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  schools: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired
  })),
  style: PropTypes.object
};