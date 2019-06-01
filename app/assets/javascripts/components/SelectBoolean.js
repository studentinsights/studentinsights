import React from 'react';
import PropTypes from 'prop-types';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';


// For selecting a true/false value
export default function SelectBoolean(props) {
  const {value, onChange, placeholder, style, options} = props;
  
  // SimpleFilterSelect expects text, so we do some conversions
  return (
    <SimpleFilterSelect
      style={style}
      placeholder={placeholder}
      value={value.toString()}
      onChange={value => onChange(value === ALL ? ALL : (value.toString() === 'true'))}
      options={options} />
  );
}
SelectBoolean.propTypes = {
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object),
  style: PropTypes.object
};
SelectBoolean.defaultProps = {
  options: [
    {value: ALL, label: 'All'},
    {value: true, label: 'Yes'},
    {value: false, label: 'No'}
  ]
};