import React from 'react';
import PropTypes from 'prop-types';
import SimpleFilterSelect from '../components/SimpleFilterSelect';


// UI component for selecting what kind of absences to look at
export default function SelectExcusedAbsences({excusedAbsencesKey, onChange, style = undefined}) { 
  return (
    <SimpleFilterSelect
      style={style}
      value={excusedAbsencesKey}
      onChange={onChange}
      options={[
        { value: EXCLUDE_EXCUSED_ABSENCES, label: 'Unexcused' },
        { value: ALL_ABSENCES, label: 'All absences' }
      ]}
    />
  );
}
SelectExcusedAbsences.propTypes = {
  excusedAbsencesKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object
};


export const EXCLUDE_EXCUSED_ABSENCES = 'EXCLUDE_EXCUSED_ABSENCES';
export const ALL_ABSENCES = 'ALL_ABSENCES';
