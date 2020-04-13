import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {allGrades, gradeText} from '../helpers/gradeText';
import SimpleFilterSelect, {ALL} from './SimpleFilterSelect';


// For selecting a grade
export default function SelectGrade({grade, onChange, grades, placeholder = undefined, style = undefined}) {
  const availableGrades = grades || allGrades();
  const sortedGrades = _.sortBy(availableGrades, rankedByGradeLevel);
  const gradeOptions = [{value: ALL, label: 'All'}].concat(sortedGrades.map(grade => {
    return { value: grade, label: gradeText(grade) };
  }));
  return (
    <SimpleFilterSelect
      style={style}
      placeholder={placeholder || "Grade..."}
      value={grade}
      onChange={onChange}
      options={gradeOptions} />
  );
}
SelectGrade.propTypes = {
  grade: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  grades: PropTypes.arrayOf(PropTypes.string),
  placeholder: PropTypes.string,
  style: PropTypes.object
};