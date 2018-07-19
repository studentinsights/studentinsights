import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';


// Used to represent "don't filter, include everything" across different filter components.
export const ALL = 'ALL';

// For simple <Select /> components, fixing their width and translating special value `ALL` to
// null so that `placeholder` can be used to name what this component can filter when there's
// no value selecting, saving horizontal space.
export default function SimpleFilterSelect(props) {
  return (
    <Select
      style={props.style || { width: '10em', marginRight: 10 }}
      value={props.value === ALL ? null : props.value} // so Select shows placeholder text
      simpleValue
      clearable={false}
      {..._.omit(props, 'value', 'style')}
    />
  );
}
SimpleFilterSelect.propTypes = {
  ...Select.propTypes,
  value: PropTypes.string.isRequired
};
