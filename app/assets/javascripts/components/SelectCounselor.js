import React from 'react';
import PropTypes from 'prop-types';
import SimpleFilterSelect from './SimpleFilterSelect';
import {maybeCapitalize} from '../helpers/pretty';
import {ALL} from './FilterBar';


// For selecting a counselor (eg, Somerville HS)
export default function SelectCounselor({counselor, onChange, counselors, style = undefined}) {
  const counselorOptions = [{value: ALL, label: 'All'}].concat(counselors.map(counselor => {
    return { value: counselor, label: `${maybeCapitalize(counselor)}` };
  }));
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="Counselor..."
      value={counselor}
      onChange={onChange}
      options={counselorOptions} />
  );
}
SelectCounselor.propTypes = {
  counselor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  counselors: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.object
};