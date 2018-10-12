import React from 'react';
import PropTypes from 'prop-types';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';
import {maybeCapitalize} from '../helpers/pretty';


// For selecting a type of discipline incident (eg. Cell Phone Use)
export default function SelectDisciplineIncidentType({type, onChange, types, style = undefined}) {
  const typeOptions = [{value: ALL, label: 'All'}].concat(types.map(type => {
    return { value: type, label: `${maybeCapitalize(type)}` };
  }));
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="Incident Type..."
      value={type}
      onChange={onChange}
      options={typeOptions} />
  );
}
SelectDisciplineIncidentType.propTypes = {
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  types: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.object
};