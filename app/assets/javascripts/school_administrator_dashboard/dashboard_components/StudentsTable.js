import React from 'react';
import PropTypes from 'prop-types';

import SortHelpers from '../../helpers/sort_helpers.jsx';
import * as Routes from '../../helpers/Routes';

class StudentsTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'events',
      sortType: 'number',
      sortDesc: true,
      slectedHomeroom: null,
      schoolYearFlag: false
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
      return rows.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
    case 'number':
      return rows.sort((a, b) => SortHelpers.sortByNumber(a, b, sortBy));
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
    return(
      <div className= 'StudentsList'>
        <table className='students-list'>
          <caption>{this.renderCaption()}</caption>
          <thead>
            <tr>
              <th width="66.66%"
                  onClick={this.onClickHeader.bind(null, 'last_name', 'string')}
                  className={this.headerClassName('last_name')}>Name</th>
              <th width="33.33"
                  onClick={this.onClickHeader.bind(null, 'events', 'number')}
                  className={this.headerClassName('events')}>Incidents</th>
            </tr>
          </thead>
          <tfoot>
            <tr>
              <td width="66.66%">{'Total: '}</td>
              <td width="33.33%">{this.totalEvents()}</td>
            </tr>
          </tfoot>
          <tbody>
            {this.orderedRows().map(student => {
              return (
                <tr key={student.id}>
                  <td width="66.66%">
                    <a href={Routes.studentProfile(student.id)}>
                      {student.last_name}, {student.first_name}
                    </a>
                  </td>
                  <td width="33.33%">{student.events}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderCaption() {
    const schoolYearCaption = this.props.schoolYearFlag? " (School Year)" : "";
    return this.props.selectedHomeroom ? this.props.selectedHomeroom + schoolYearCaption : "All Students" + schoolYearCaption;
  }
}

StudentsTable.propTypes = {
  rows: PropTypes.array.isRequired,
  selectedHomeroom: PropTypes.string,
  schoolYearFlag: PropTypes.bool
};

export default StudentsTable;
