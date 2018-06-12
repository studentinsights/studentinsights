import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';


// Shows a list of students for the educator.  Intended as a directory
// for navigation, showing everything that's in the student searchbar all at once.
// 
// This isn't for doing analysis or looking at data.
export default class MyStudentsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchStudents = this.fetchStudents.bind(this);
    this.renderStudents = this.renderStudents.bind(this);
  }

  componentDidMount() {
    // updateGlobalStylesToTakeFullHeight();
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

  orderedRows() {
    const {students} = this.props;
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
    const {sortDirection, sortBy} = this.state;
    const sortedStudents = this.orderedRows();

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>My students</SectionHeading>
        <AutoSizer style={{margin: 10}}>
          {({width, height}) => (
            <Table
              width={width}
              height={height}
              headerHeight={25}
              headerStyle={{display: 'flex'}} // necessary for layout, not sure why
              rowStyle={{display: 'flex'}} // necessary for layout, not sure why
              style={{fontSize: 14}}
              rowHeight={25}
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
                width={150}
              />
              <Column
                label='School'
                dataKey='school'
                cellRenderer={this.renderSchool}
                width={250}
              />
              <Column
                label='Grade'
                dataKey='grade'
                width={80}
              />
              <Column
                label='House'
                dataKey='house'
                cellDataGetter={({cellData}) => maybeCapitalize(cellData)}
                width={150}
              />
              <Column
                label='Counselor'
                dataKey='counselor'
                cellDataGetter={({cellData}) => maybeCapitalize(cellData)}
                width={150}
              />
            </Table>
          )}
        </AutoSizer>
      </div>
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
}
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


// Counselor names are stored as mixed case.  This makes them look nice either way.
function maybeCapitalize(maybeValue) {
  return (maybeValue === null || maybeValue === undefined || !_.isFunction(maybeValue.toLowerCase))
    ? null
    : _.capitalize(maybeValue.toLowerCase());
}
