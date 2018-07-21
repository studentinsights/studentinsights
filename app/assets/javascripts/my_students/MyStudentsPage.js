import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {maybeCapitalize} from '../helpers/pretty';
import {supportsHouse, supportsCounselor, supportsSpedLiaison, prettyProgramText} from '../helpers/PerDistrict';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import HouseBadge from '../components/HouseBadge';
import School from '../components/School';
import FilterStudentsBar from './FilterStudentsBar';


// Shows a list of students for the educator.  Intended as a directory
// for navigation, showing everything that's in the student searchbar all at once.
// This isn't for doing analysis or looking at data.
export default class MyStudentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  fetchStudents() {
    const url = `/api/educators/my_students_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="MyStudentsPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={this.fetchStudents}
          style={styles.flexVertical}
          render={this.renderStudents} />
      </div>
    );
  }

  renderStudents(json) {
    const {students} = json;
    return <MyStudentsPageView students={students} />;
  }
}


export class MyStudentsPageView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderSchool = this.renderSchool.bind(this);
  }

  orderedStudents(students) {
    const {sortBy, sortDirection} = this.state;

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(student) { return student[sortBy]; },
      grade(student) { return rankedByGradeLevel(student.grade); },
      school(student) { return student.school.name; },
      name(student) { return `${student.last_name}, ${student.first_name}`; }
    };
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const sortedRows = _.sortBy(students, sortFn);

    // respect direction
    return (sortDirection == SortDirection.DESC) 
      ? sortedRows.reverse()
      : sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    if (sortBy === this.state.sortBy) {
      const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
        ? SortDirection.ASC
        : SortDirection.DESC;
      this.setState({ sortDirection: oppositeSortDirection });
    } else {
      this.setState({sortBy});
    }
  }

  render() {
    const {districtKey} = this.context;
    const {students} = this.props;

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>My students</SectionHeading>
        <FilterStudentsBar
          students={students}
          style={{...styles.flexVertical, marginLeft: 10, marginTop: 20}}
          includeHouse={supportsHouse(districtKey)}
          includeCounselor={supportsCounselor(districtKey)}>
          {filteredStudents => this.renderTable(filteredStudents)}
        </FilterStudentsBar>
      </div>
    );
  }

  renderTable(filteredStudents) {
    const {districtKey} = this.context;
    const {sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedStudents(filteredStudents);
    const rowHeight = 40; // for two lines of student names

    // In conjuction with the filtering, this can lead to a warning in development.
    // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
    return (
      <AutoSizer style={{marginTop: 20}}>
        {({width, height}) => (
          <Table
            width={width}
            height={height}
            headerHeight={rowHeight}
            headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
            rowStyle={{display: 'flex'}}
            style={{fontSize: 14}}
            rowHeight={rowHeight}
            rowCount={sortedStudents.length}
            rowGetter={({index}) => sortedStudents[index]}
            sort={this.onTableSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
            >
            <Column
              label='Name'
              dataKey='name'
              cellRenderer={this.renderName}
              flexGrow={1}
              width={250}
            />
            <Column
              label='School'
              dataKey='school'
              cellRenderer={this.renderSchool}
              width={120}
            />
            <Column
              label='Grade'
              dataKey='grade'
              width={100}
            />
            <Column
             label='Program'
             dataKey='program'
             cellRenderer={this.renderProgram}
             width={150}
            />
            {supportsHouse(districtKey) &&
              <Column
                label='House'
                dataKey='house'
                cellRenderer={this.renderHouse}
                width={120} />
            }
            {supportsCounselor(districtKey) && 
              <Column
                label='Counselor'
                dataKey='counselor'
                cellDataGetter={({rowData}) => maybeCapitalize(rowData.counselor)}
                width={100}
              />
            }
            {supportsSpedLiaison(districtKey) && 
              <Column
                label='SPED Liaison'
                dataKey='sped_liaison'
                cellDataGetter={({rowData}) => maybeCapitalize(rowData.sped_liaison)}
                width={100}
              />
            }
          </Table>
        )}
      </AutoSizer>
    );
  }

  renderName(cellProps) {
    const student = cellProps.rowData;
    return <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank">{student.first_name} {student.last_name}</a>;
  }

  renderSchool(cellProps) {
    const student = cellProps.rowData;
    return <School {...student.school} />;
  }

  renderHouse(cellProps) {
    const student = cellProps.rowData;
    return student.house && <HouseBadge house={student.house} />;
  }

  renderProgram(cellProps) {
    const student = cellProps.rowData;
    return prettyProgramText(student.program_assigned, student.sped_placement);
  }
}
MyStudentsPageView.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
MyStudentsPageView.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    house: PropTypes.string,
    counselor: PropTypes.string,
    grade: PropTypes.string.isRequired,
    school: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
  })).isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};