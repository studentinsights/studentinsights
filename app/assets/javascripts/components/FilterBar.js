import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {maybeCapitalize} from '../helpers/pretty';
import {allGrades, gradeText} from '../helpers/gradeText';
import {somervilleHouses} from '../helpers/PerDistrict';
import {firstDayOfSchoolFor} from '../helpers/schoolYear';


export default function FilterBar(props) {
  const {children, style, barStyle, labelText} = props;

  return (
    <div className="FilterBar" style={style}>
      <div style={{...styles.bar, ...barStyle}}>
        <span style={styles.label}>{labelText || 'Filter by'}</span>
        {children}
      </div>
    </div>
  );
}
FilterBar.propTypes = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  barStyle: PropTypes.object,
  labelText: PropTypes.string,
  onClear: PropTypes.func
};

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center'
  },
  label: {
    display: 'inline-block',
    marginBottom: 4, // fudging vertical alignment
    marginRight: 10
  }
};













export function GradeSelect({grade, onChange, grades, style = undefined}) {
  const sortedGrades = _.sortBy(grades || allGrades(), rankedByGradeLevel);
  const gradeOptions = [{value: ALL, label: 'All'}].concat(sortedGrades.map(grade => {
    return { value: grade, label: gradeText(grade) };
  }));
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="Grade..."
      value={grade}
      onChange={onChange}
      options={gradeOptions} />
  );
}
GradeSelect.propTypes = {
  grade: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  grades: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
};

export const ALL = 'ALL';
export function HouseSelect({house, onChange, houses, style = undefined}) {
  const sortedHouses = _.sortBy(houses || somervilleHouses());
  const houseOptions = [{value: ALL, label: 'All'}].concat(sortedHouses.map(house => {
    return { value: house, label: `${maybeCapitalize(house)} house` };
  }));
  return (
    <SimpleFilterSelect
      style={style}
      placeholder="House..."
      value={house}
      onChange={onChange}
      options={houseOptions} />
  );
}
HouseSelect.propTypes = {
  house: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  houses: PropTypes.arrayOf(PropTypes.string),
  style: PropTypes.object
};



// Returns [startMoment, endMoment] range represented by `timeRangeKey`
// at the given `nowMoment`.
export function momentRange(timeRangeKey, nowMoment) {
  const startMoment = {
    [TIME_RANGE_45_DAYS_AGO]: nowMoment.clone().subtract(45, 'days'),
    [TIME_RANGE_90_DAYS_AGO]: nowMoment.clone().subtract(90, 'days'),
    [TIME_RANGE_SCHOOL_YEAR]: firstDayOfSchoolFor(nowMoment)
  }[timeRangeKey];

  return [startMoment.startOf('day'), nowMoment.startOf('day')];
}

export function timeRangeText(timeRangeKey) {
  return {
    TIME_RANGE_45_DAYS_AGO: 'Last 45 days',
    TIME_RANGE_90_DAYS_AGO: 'Last 90 days',
    TIME_RANGE_SCHOOL_YEAR: 'School year'
  }[timeRangeKey];
}
export const TIME_RANGE_45_DAYS_AGO = 'TIME_RANGE_45_DAYS_AGO';
export const TIME_RANGE_90_DAYS_AGO = 'TIME_RANGE_90_DAYS_AGO';
export const TIME_RANGE_SCHOOL_YEAR = 'TIME_RANGE_SCHOOL_YEAR';


export function TimeRangeSelect(props) {
  const {timeRangeKey, onChange} = props;
  const options = [
    TIME_RANGE_45_DAYS_AGO,
    TIME_RANGE_90_DAYS_AGO,
    TIME_RANGE_SCHOOL_YEAR
  ].map(timeRangeKey => {
    return { value: timeRangeKey, label: timeRangeText(timeRangeKey) };
  });
  return (
    <SimpleFilterSelect
      placeholder="House..."
      value={timeRangeKey}
      onChange={onChange}
      options={options} 
      {...props} />
  );
}
TimeRangeSelect.propTypes = {
  timeRangeKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export const EXCLUDE_EXCUSED_ABSENCES = 'EXCLUDE_EXCUSED_ABSENCES';
export const ALL_ABSENCES = 'ALL_ABSENCES';
export function ExcusedAbsencesSelect({excusedAbsencesKey, onChange, style = undefined}) { 
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
ExcusedAbsencesSelect.propTypes = {
  excusedAbsencesKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  style: PropTypes.object
};




function SimpleFilterSelect(props) {
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
  // renderSearch(filteredStudents) {
    // // Matching react-select
    // search: {
    //   display: 'inline-block',
    //   padding: '7px 7px 7px 12px',
    //   borderRadius: 4,
    //   border: '1px solid #ccc',
    //   marginLeft: 20,
    //   marginRight: 10,
    //   fontSize: 14,
    //   width: 220
    // },
  //   const {searchText} = this.state;
  //   return (
  //     <input
  //       style={styles.search}
  //       ref={el => this.searchInputEl = el}
  //       placeholder={`Search ${filteredStudents.length} students...`}
  //       value={searchText}
  //       onChange={this.onSearchChanged} />
  //   );
  // }
  // renderCounselorSelect() {
  //   const {students} = this.props;
  //   const {counselor} = this.state;

  //   // Find all values in students
  //   const sortedCounselors = _.sortBy(_.uniq(_.compact(students.map(student => student.counselor))));
  //   if (sortedCounselors.length === 0) return;
  //   const counselorOptions = [{value: null, label: 'All'}].concat(sortedCounselors.map(counselor => {
  //     return { value: counselor, label: maybeCapitalize(counselor) };
  //   }));
  //   return (
  //     <Select
  //       simpleValue
  //       placeholder="Counselor..."
  //       clearable={false}
  //       value={counselor}
  //       onChange={this.onCounselorChanged}
  //       options={counselorOptions} />
  //   );
  // }