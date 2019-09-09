import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {isHomeroomMeaningful} from '../helpers/PerDistrict';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SelectHouse from '../components/SelectHouse';
import SelectHomeroomByEducator from '../components/SelectHomeroomByEducator';
import SelectGrade from '../components/SelectGrade';
import SelectTimeRange from '../components/SelectTimeRange';
import SelectCounselor from '../components/SelectCounselor';
import {ALL} from '../components/SimpleFilterSelect';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {
  TIME_RANGE_7_DAYS_AGO,
  TIME_RANGE_30_DAYS_AGO,
  TIME_RANGE_45_DAYS_AGO,
  TIME_RANGE_90_DAYS_AGO,
  TIME_RANGE_FOUR_YEARS,
  TIME_RANGE_ALL
} from '../components/SelectTimeRange';

// Takes a list of students, uses them to find values to sort by,
// and then renders a filtering bar for different dimensions, yielding
// the sorted students to `children`.
export default class FilterStudentsBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onTimeRangeChanged = this.onTimeRangeChanged.bind(this);
    this.onEscape = this.onEscape.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHomeroomChanged = this.onHomeroomChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
  }

  filteredStudents() {
    const {districtKey} = this.context;
    const {students, timeFilterFn} = this.props;
    const {searchText, grade, house, counselor, homeroomId, timeRangeKey} = this.state;

    return students.filter(student => {
      if (shouldFilterOut(grade, student.grade)) return false;
      if (shouldFilterOut(house, student.house)) return false;
      if (shouldFilterOut(counselor, student.counselor)) return false;
      if (shouldFilterOut(homeroomId, student.homeroom && student.homeroom.id.toString())) return false;
      if (!searchTextMatches(districtKey, searchText, student)) return false;
      if (timeFilterFn && !timeFilterFn(student, timeRangeKey)) return false; // eg, interpret what time range means
      return true;
    });
  }

  onEscape() {
    this.setState(initialState());
  }

  onSearchChanged(e) {
    this.setState({searchText: e.target.value});
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onHomeroomChanged(homeroomId) {
    this.setState({homeroomId});
  }

  onHouseChanged(house) {
    this.setState({house});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor});
  }

  onTimeRangeChanged(timeRangeKey) {
    this.setState({timeRangeKey});
  }

  render() {
    const {children, style, barStyle} = this.props;
    const filteredStudents = this.filteredStudents();

    return (
      <EscapeListener className="FilterStudentsBar" style={style} onEscape={this.onEscape}>
        <FilterBar style={barStyle}>
          {this.renderSearch(filteredStudents)}
          {this.renderGradeSelect()}
          {this.renderHomeroomSelect()}
          {this.renderHouseSelect()}
          {this.renderCounselorSelect()}
          {this.renderTimeRangeSelect()}
        </FilterBar>
        {children(filteredStudents)}
      </EscapeListener>
    );
  }

  renderSearch(filteredStudents) {
    const {searchText} = this.state;
    return (
      <input
        style={styles.search}
        ref={el => this.searchInputEl = el}
        placeholder={`Search ${filteredStudents.length} students...`}
        value={searchText}
        onChange={this.onSearchChanged} />
    );
  }

  renderGradeSelect() {
    const {students} = this.props;
    const {grade} = this.state;
    const sortedGrades = _.sortBy(_.uniq(students.map(student => student.grade)), rankedByGradeLevel);
    return (
      <SelectGrade
        style={styles.select}
        grade={grade}
        grades={sortedGrades}
        onChange={this.onGradeChanged} />
    );
  }

  renderHomeroomSelect() {
    const {students, includeHomeroom} = this.props;
    if (!includeHomeroom) return;

    const {homeroomId} = this.state;
    const homeroomsWithEducators = students.map(s => s.homeroom).filter(h => h && h.educator);
    const homerooms = _.uniqBy(homeroomsWithEducators, 'id');
    return (
      <SelectHomeroomByEducator
        style={styles.select}
        placeholder={`Homeroom...`}
        homerooms={homerooms}
        homeroomId={homeroomId}
        onChange={this.onHomeroomChanged} />
    );
  }

  renderHouseSelect() {
    const {students, includeHouse} = this.props;
    if (!includeHouse) return null;

    const {house} = this.state;
    const sortedHouses = _.sortBy(_.uniq(_.compact(students.map(student => student.house))));
    return (
      <SelectHouse
        style={styles.select}
        house={house}
        houses={sortedHouses}
        onChange={this.onHouseChanged} />
    );
  }

  renderTimeRangeSelect() {
    const {includeTimeRange} = this.props;
    if (!includeTimeRange) return null;

    const {timeRangeKey} = this.state;
    const timeRangeKeys = [
      TIME_RANGE_ALL,
      TIME_RANGE_7_DAYS_AGO,
      TIME_RANGE_30_DAYS_AGO,
      TIME_RANGE_45_DAYS_AGO,
      TIME_RANGE_90_DAYS_AGO,
      TIME_RANGE_FOUR_YEARS
    ];
    
    return (
      <SelectTimeRange
        style={{width: '9em'}}
        timeRangeKey={timeRangeKey}
        timeRangeKeys={timeRangeKeys}
        onChange={this.onTimeRangeChanged} />
    );
  }

  renderCounselorSelect() {
    const {students, includeCounselor} = this.props;
    if (!includeCounselor) return null;
    const {counselor} = this.state;
    const sortedCounselors = _.sortBy(_.uniq(_.compact(students.map(student => student.counselor))));
    return (
      <SelectCounselor
        style={styles.select}
        counselor={counselor}
        counselors={sortedCounselors}
        onChange={this.onCounselorChanged} />
    );
  }
}
FilterStudentsBar.propTypes = {
  includeHomeroom: PropTypes.bool.isRequired,
  includeCounselor: PropTypes.bool.isRequired,
  includeHouse: PropTypes.bool.isRequired,
  includeTimeRange: PropTypes.bool,
  students: PropTypes.arrayOf(PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    program_assigned: PropTypes.string,
    sped_placement: PropTypes.string,
    house: PropTypes.string,
    counselor: PropTypes.string,
    sped_liaison: PropTypes.string
  })).isRequired,
  children: PropTypes.func.isRequired,
  timeFilterFn: PropTypes.func,
  style: PropTypes.object,
  barStyle: PropTypes.object
};

const styles = {
  select: {
    width: '9em',
    marginRight: 10
  },

  // Matching react-select
  search: {
    display: 'inline-block',
    padding: '7px 7px 7px 12px',
    borderRadius: 4,
    border: '1px solid #ccc',
    marginLeft: 20,
    marginRight: 10,
    fontSize: 14,
    width: 220
  },
};


function initialState() {
  return {
    searchText: '',
    grade: ALL,
    house: ALL,
    counselor: ALL,
    homeroomId: ALL,
    timeRangeKey: TIME_RANGE_ALL
  };
}

function shouldFilterOut(selectedValue, studentValue) {
  if (selectedValue === ALL) return false; // no filter
  return (studentValue !== selectedValue);
}

export function searchTextMatches(districtKey, searchText, student) {
  if (searchText === '') return true;

  // Possible include homeroom elements, if they were shown
  const {homeroom, school} = student;
  const includeHomeroom = homeroom && school && isHomeroomMeaningful(districtKey, school.local_id);
  const homeroomTexts = (!includeHomeroom) ? [] : _.compact([
    homeroom.name,
    homeroom.educator && homeroom.educator.full_name
  ]);

  // match
  const tokens = searchText.toLowerCase().split(' ');
  const studentText = _.compact([
    student.first_name,
    student.last_name,
    student.grade,
    student.house,
    student.counselor,
    student.sped_liaison,
    student.program_assigned,
    student.sped_placement,
    student.school && student.school.name,
    ...homeroomTexts
  ]).join(' ').toLowerCase();
  return _.every(tokens, token => studentText.indexOf(token) !== -1);
}
