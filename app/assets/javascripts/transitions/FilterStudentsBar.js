import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {shortSchoolName} from '../helpers/PerDistrict';
import EscapeListener from '../components/EscapeListener';
import FilterBar from '../components/FilterBar';
import SelectSchool from '../components/SelectSchool';
import SelectGrade from '../components/SelectGrade';
import SelectCounselor from '../components/SelectCounselor';
import SelectBoolean from '../components/SelectBoolean';
import {ALL} from '../components/SimpleFilterSelect';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {hasNote, isStarred} from './helpers';


// Takes a list of students, uses them to find values to sort by,
// and then renders a filtering bar for different dimensions, yielding
// the sorted students to `children`.
export default class FilterStudentsBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onEscape = this.onEscape.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onSchoolIdChanged = this.onSchoolIdChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
  }

  filteredStudents() {
    const {students} = this.props;
    const {searchText, grade, schoolId, counselor} = this.state;

    return students.filter(student => {
      if (shouldFilterOut(grade, student.grade)) return false;
      if (shouldFilterOut(schoolId, student.school.id)) return false;
      if (shouldFilterOut(counselor, student.counselor)) return false;
      if (shouldFilterOut(this.state.isStarred, isStarred(student))) return false;
      if (shouldFilterOut(this.state.hasNote, hasNote(student))) return false;
      if (!searchTextMatches(searchText, student)) return false;
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

  onSchoolIdChanged(schoolId) {
    this.setState({schoolId});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor});
  }

  render() {
    const {children, style, barStyle} = this.props;
    const filteredStudents = this.filteredStudents();

    return (
      <EscapeListener className="FilterStudentsBar" style={style} onEscape={this.onEscape}>
        <FilterBar style={barStyle}>
          {this.renderSearch(filteredStudents)}
          {this.renderGradeSelect()}
          {this.renderSchoolSelect()}
          {this.renderCounselorSelect()}
          {this.renderHasNoteSelect()}
          {this.renderIsStarredSelect()}
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

  renderSchoolSelect() {
    const {districtKey} = this.context;
    const {students} = this.props;
    const {schoolId} = this.state;
    const schools = _.uniq(_.compact(students.map(student => student.school))).map(school => {
      return {
        id: school.id,
        label: shortSchoolName(districtKey, school.local_id) 
      };
    });
    return (
      <SelectSchool
        style={styles.select}
        schoolId={schoolId}
        schools={schools}
        onChange={this.onSchoolIdChanged} />
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

  renderHasNoteSelect() {
    const {hasNote} = this.state;
    return (
      <SelectBoolean
        style={styles.select}
        placeholder="Note?"
        value={hasNote}
        onChange={hasNote => this.setState({hasNote})}
      />
    );
  }

  renderIsStarredSelect() {
    const {isStarred} = this.state;
    return (
      <SelectBoolean
        style={styles.select}
        placeholder="Starred?"
        value={isStarred}
        onChange={isStarred => this.setState({isStarred})}
      />
    );
  }
}
FilterStudentsBar.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
FilterStudentsBar.propTypes = {
  includeCounselor: PropTypes.bool.isRequired,
  students: PropTypes.arrayOf(PropTypes.shape({
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    counselor: PropTypes.string,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired
  })).isRequired,
  children: PropTypes.func.isRequired,
  style: PropTypes.object,
  barStyle: PropTypes.object
};

const styles = {
  select: {
    width: '8em',
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
    width: 200
  },
};


function initialState() {
  return {
    searchText: '',
    grade: ALL,
    schoolId: ALL,
    counselor: ALL,
    hasNote: ALL,
    isStarred: ALL
  };
}

function shouldFilterOut(selectedValue, studentValue) {
  if (selectedValue === ALL) return false; // no filter
  return (studentValue !== selectedValue);
}

export function searchTextMatches(searchText, student) {
  if (searchText === '') return true;
  const tokens = searchText.toLowerCase().split(' ');
  const studentText = _.compact([
    student.first_name,
    student.last_name,
    student.grade,
    student.counselor,
    student.school.name
  ]).join(' ').toLowerCase();
  return _.every(tokens, token => studentText.indexOf(token) !== -1);
}
