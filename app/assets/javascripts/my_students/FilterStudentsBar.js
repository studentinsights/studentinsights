import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Select from 'react-select';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {maybeCapitalize} from '../helpers/pretty';
import {gradeText} from '../helpers/gradeText';

// Takes a list of students, uses them to find values to sort by,
// and then renders a filtering bar for different dimensions, yielding
// the sorted students to `children`.
export default class FilterStudentsBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState();

    this.onKeyUp = this.onKeyUp.bind(this);
    this.onSearchChanged = this.onSearchChanged.bind(this);
    this.onGradeChanged = this.onGradeChanged.bind(this);
    this.onHouseChanged = this.onHouseChanged.bind(this);
    this.onCounselorChanged = this.onCounselorChanged.bind(this);
  }

  filteredStudents() {
    const {students} = this.props;
    const {searchText, grade, house, counselor} = this.state;

    return students.filter(student => {
      if (shouldFilterOut(grade, student.grade)) return false;
      if (shouldFilterOut(house, student.house)) return false;
      if (shouldFilterOut(counselor, student.counselor)) return false;
      if (!searchTextMatches(searchText, student)) return false;
      return true;
    });
  }

  onKeyUp(e) {
    if (e.which === 27) this.setState(initialState());
  }

  onSearchChanged(e) {
    this.setState({searchText: e.target.value});
  }

  onGradeChanged(grade) {
    this.setState({grade});
  }

  onHouseChanged(house) {
    this.setState({house});
  }

  onCounselorChanged(counselor) {
    this.setState({counselor});
  }

  render() {
    const {children, style, barStyle} = this.props;
    const filteredStudents = this.filteredStudents();

    return (
      <div className="FilterStudentsBar" style={style} onKeyUp={this.onKeyUp}>
        <div style={{...styles.bar, ...barStyle}}>
          <span style={styles.label}>Filter by</span>
          {this.renderSearch(filteredStudents)}
          {this.renderGradeSelect()}
          {this.renderHouseSelect()}
          {this.renderCounselorSelect()}
        </div>
        {children(filteredStudents)}
      </div>
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

    // Find all grade values in students
    const sortedGrades = _.sortBy(_.uniq(students.map(student => student.grade)), rankedByGradeLevel);
    const gradeOptions = [{value: null, label: 'All'}].concat(sortedGrades.map(grade => {
      return { value: grade, label: gradeText(grade) };
    }));
    return (
      <Select
        style={styles.select}
        simpleValue
        placeholder="Grade..."
        clearable={false}
        value={grade}
        onChange={this.onGradeChanged}
        options={gradeOptions} />
    );
  }

  renderHouseSelect() {
    const {students} = this.props;
    const {house} = this.state;

    // Find all values in students
    const sortedHouses = _.sortBy(_.uniq(_.compact(students.map(student => student.house))));
    if (sortedHouses.length === 0) return;
    const houseOptions = [{value: null, label: 'All'}].concat(sortedHouses.map(house => {
      return { value: house, label: `${maybeCapitalize(house)} house` };
    }));
    return (
      <Select
        style={styles.select}
        simpleValue
        placeholder="House..."
        clearable={false}
        value={house}
        onChange={this.onHouseChanged}
        options={houseOptions} />
    );
  }

  renderCounselorSelect() {
    const {students} = this.props;
    const {counselor} = this.state;

    // Find all values in students
    const sortedCounselors = _.sortBy(_.uniq(_.compact(students.map(student => student.counselor))));
    if (sortedCounselors.length === 0) return;
    const counselorOptions = [{value: null, label: 'All'}].concat(sortedCounselors.map(counselor => {
      return { value: counselor, label: maybeCapitalize(counselor) };
    }));
    return (
      <Select
        style={styles.select}
        simpleValue
        placeholder="Counselor..."
        clearable={false}
        value={counselor}
        onChange={this.onCounselorChanged}
        options={counselorOptions} />
    );
  }
}
FilterStudentsBar.propTypes = {
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
  style: PropTypes.object,
  barStyle: PropTypes.object
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
  },
  select: {
    width: '10em',
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
    grade: null,
    house: null,
    counselor: null
  };
}

function shouldFilterOut(selectedValue, studentValue) {
  if (selectedValue === null || selectedValue === undefined) return false; // no filter applied
  return (studentValue !== selectedValue);
}

export function searchTextMatches(searchText, student) {
  if (searchText === '') return true;
  const tokens = searchText.toLowerCase().split(' ');
  const studentText = _.compact([
    student.first_name,
    student.last_name,
    student.grade,
    student.house,
    student.counselor,
    student.sped_liaison,
    student.school.name,
    student.program_assigned,
    student.sped_placement
  ]).join(' ').toLowerCase();
  return _.all(tokens, token => studentText.indexOf(token) !== -1);
}
