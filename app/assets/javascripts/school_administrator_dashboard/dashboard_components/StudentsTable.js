import React from 'react';
import PropTypes from 'prop-types';
import {
  sortByString,
  sortByNumber,
  sortByDate
} from '../../helpers/SortHelpers';
import * as Routes from '../../helpers/Routes';
import SharedPropTypes from '../../helpers/prop_types.jsx';
import DashResetButton from './DashResetButton';

class StudentsTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'events',
      sortType: 'number',
      sortDesc: true,
      selectedCategory: null,
    };

    this.onClickHeader = this.onClickHeader.bind(this);
  }

  //These methods taken directly from school overview students table. TODO, separate into helpers
  headerClassName(sortBy) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortBy !== this.state.sortBy) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  }

  sortedRows() {
    const rows = this.props.rows;
    const sortBy = this.state.sortBy;
    const sortType = this.state.sortType;

    switch(sortType) {
    case 'string':
      return rows.sort((a, b) => sortByString(a, b, sortBy));
    case 'number':
      return rows.sort((a, b) => sortByNumber(a, b, sortBy));
    case 'date':
      return rows.sort((a, b) => sortByDate(a, b, sortBy));
    default:
      return rows;
    }
  }

  orderedRows() {
    const sortedRows = this.sortedRows();

    if (!this.state.sortDesc) return sortedRows.reverse();

    return sortedRows;
  }

  totalEvents() {
    let total = 0;
    this.props.rows.forEach((student) => {
      total += student.events;
    });
    return total;
  }

  onClickHeader(sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    return (
      <div className='StudentsList'>
        <table className='students-list'>
          <div className='caption'>
            {this.renderCaption()}
            <DashResetButton clearSelection={this.props.resetFn} selectedCategory={this.props.selectedCategory}/>
          </div>
          <thead>
            <tr>
              <th className='name'
                  onClick={this.onClickHeader.bind(null, 'last_name', 'string')}
                  className={this.headerClassName('last_name')}>
                Name
              </th>
              <th onClick={this.onClickHeader.bind(null, 'grade', 'date')}
                  className={this.headerClassName('grade')}>
                Grade
              </th>
              <th onClick={this.onClickHeader.bind(null, 'events', 'number')}
                  className={this.headerClassName('events')}>
                {this.props.incidentType}
                {this.renderIncidentTypeSubtitle()}
              </th>
              <th onClick={this.onClickHeader.bind(null, 'last_sst_date_text', 'date')}
                  className={this.headerClassName('last_sst_date_text')}>
                Last SST
              </th>
            </tr>
          </thead>
          <tbody>
            {this.orderedRows().map(student => {
              return (
                <tr key={student.id}>
                  <td className='name'>
                    <a href={Routes.studentProfile(student.id)}>
                      {student.first_name} {student.last_name}
                    </a>
                  </td>
                  <td>{student.grade}</td>
                  <td>{student.events}</td>
                  <td>{student.last_sst_date_text}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>{'Total: '}</td>
              <td>{this.totalEvents()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  renderCaption() {
    const {selectedCategory} = this.props;

    return selectedCategory ? selectedCategory : 'All Students';
  }

  renderIncidentTypeSubtitle() {
    const {incidentSubtitle} = this.props;
    if (!incidentSubtitle) return;

    return (
      <span style={{fontWeight: 'normal'}}><br/>({this.props.incidentSubtitle})</span>
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
