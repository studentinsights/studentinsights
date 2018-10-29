import React from 'react';
import PropTypes from 'prop-types';
import SimpleFilterSelect from './SimpleFilterSelect';
import {englishProficiencyOptions} from '../helpers/language';


// For selecting students by English proficiency
export default class SelectEnglishProficiency extends React.Component {
  render() {
    const {districtKey} = this.context;
    const {englishProficiency, onChange, style} = this.props;
    
    const options = englishProficiencyOptions(districtKey);
    return (
      <SimpleFilterSelect
        style={style || {}}
        placeholder="Language..."
        value={englishProficiency}
        onChange={onChange}
        options={options} />
    );
  }
}
SelectEnglishProficiency.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
SelectEnglishProficiency.propTypes = {
  englishProficiency: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object
};