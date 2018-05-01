import React from 'react';
import PropTypes from 'prop-types';
import {
  sortByString,
  sortByNumber,
  sortByDate
} from '../../helpers/SortHelpers';
import * as Routes from '../../helpers/Routes';
import {sortByGrade} from '../../helpers/SortHelpers';
import SharedPropTypes from '../../helpers/prop_types.jsx';
import DashResetButton from './DashResetButton';
import {Column, Table, SortDirection} from 'react-virtualized';

class StudentsTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'events',
      sortType: 'number',
      sortDesc: true,
      selectedCategory: null,
    };

    this.onTableSort = this.onTableSort.bind(this);
    this.renderStudent = this.renderStudent.bind(this);
    this.renderRowStyle = this.renderRowStyle.bind(this);
  }

  sortedRows() {
    const rows = this.props.rows;
    const sortBy = this.state.sortBy;
    const sortType = this.state.sortType;

    switch(sortType) {
    case 'name':
      return rows.sort((a, b) => fullNameReverse(a).localeCompare(fullNameReverse(b)));
    case 'string':
      return rows.sort((a, b) => sortByString(a, b, sortBy));
    case 'number':
      return rows.sort((a, b) => sortByNumber(a, b, sortBy));
    case 'date':
      return rows.sort((a, b) => sortByDate(a, b, sortBy));
    case 'grade':
      return rows.sort((a, b) => sortByGrade(a[sortBy], b[sortBy]));
    default:
      return rows;
    }
  }

  orderedRows() {
    const sortedRows = this.sortedRows();

    if (!this.state.sortDesc) return sortedRows.reverse();

    return sortedRows;
  }

  onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
    const sortType = {
      name: 'name',
      grade: 'grade',
      events: 'number',
      last_sst_date_text: 'date'
    }[sortBy];
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    const {incidentType} = this.props;
    const {sortBy, sortDesc} = this.state;
    const list = this.orderedRows();

    return (
      <div className='StudentsList'>
        <div className='StudentsList-caption'>
          {this.renderCaption()}
          <DashResetButton clearSelection={this.props.resetFn} selectedCategory={this.props.selectedCategory}/>
        </div>
        <Table
          width={400}
          height={400}
          rowCount={list.length}
          rowGetter={({index}) => list[index]}
          headerHeight={25}
          headerStyle={{display: 'flex'}} // necessary for layout, not sure why
          rowHeight={25}
          style={{fontSize: 14}}
          rowStyle={this.renderRowStyle}
          sort={this.onTableSort}
          sortBy={sortBy}
          sortDirection={sortDesc ? SortDirection.DESC : SortDirection.ASC}
        >
          <Column
            label='Name'
            dataKey='name'
            cellDataGetter={({rowData}) => fullName(rowData)}
            cellRenderer={this.renderStudent}
            flexGrow={1}
            width={100}
          />
          <Column
            width={60}
            label='Grade'
            dataKey='grade'
          />
          <Column
            width={85}
            label={incidentType}
            dataKey='events'
          />
          <Column
            width={85}
            label='Last SST'
            dataKey='last_sst_date_text'
          />
        </Table>
        <div>{'Total: '}</div>
        <div>{this.renderTotalEvents()}</div>
      </div>
    );
  }

  // Table striping
  renderRowStyle({index}) {
    const flexStyles = { display: 'flex' }; // necessary for layout, not sure why
    if (index < 0) { // header
      return {...flexStyles, fontWeight: 'bold' };
    } else {
      return index % 2 === 0
        ? flexStyles
        : {...flexStyles, backgroundColor: '#fafafa' };
    }
  }

  renderStudent({rowData}) {
    const student = rowData;
    return (
      <a href={Routes.studentProfile(student.id)} style={styles.truncatedLink}>
        {fullName(student)}
      </a>
    );
  }

  renderCaption() {
    const {selectedCategory} = this.props;

    return selectedCategory ? selectedCategory : 'All Students';
  }

  renderTotalEvents() {
    let total = 0;
    this.props.rows.forEach((student) => {
      total += student.events;
    });
    return total;
  }

  renderIncidentTypeSubtitle() {
    const {incidentSubtitle} = this.props;
    if (!incidentSubtitle) return;

    return (
      <span className='incident_subtitle'><br/>({this.props.incidentSubtitle})</span>
    );
  }
}

StudentsTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    events: PropTypes.number.isRequired,
    last_sst_date_text: SharedPropTypes.nullableWithKey(PropTypes.string)
  })).isRequired,
  selectedCategory: PropTypes.string,
  incidentType: PropTypes.string.isRequired, // Specific incident type being displayed
  incidentSubtitle: PropTypes.string,
  resetFn: PropTypes.func.isRequired, // Function to reset student list to display all students
};
export default StudentsTable;

function fullName(student) {
  return`${student.first_name} ${student.last_name}`;
}

function fullNameReverse(student) {
  return`${student.last_name}, ${student.first_name}`;
}

const styles = {
  truncatedLink: {
    display: 'inline-block',
    width: '100%',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis'
  }
};