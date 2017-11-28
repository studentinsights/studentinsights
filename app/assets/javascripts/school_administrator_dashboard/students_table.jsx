import React from 'react';
import SortHelpers from '../helpers/SortHelpers';


export default React.createClass({
  displayName: 'StudentsTable',

  propTypes: {
    rows: React.PropTypes.array.isRequired,
    selectedHomeroom: React.PropTypes.string
  },

  getInitialState () {
    return {
      sortBy: 'absences',
      sortType: 'number',
      sortDesc: true,
      slectedHomeroom: null
    };
  },

  //These methods taken directly from school overview students table. TODO, separate into helpers
  headerClassName (sortBy) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortBy !== this.state.sortBy) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  },

  sortedRows () {
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
  },

  orderedRows () {
    const sortedRows = this.sortedRows();

    if (!this.state.sortDesc) return sortedRows.reverse();

    return sortedRows;
  },

  totalAbsences () {
    let total = 0;
    this.props.rows.forEach((student) => {
      total += student.absences;
    });
    return total;
  },

  onClickHeader (sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  },

  render: function() {
    return(
      <div className= 'StudentsList'>
        <table className='students-list'>
          <caption>{this.renderCaption()}</caption>
          <thead>
            <tr>
              {this.renderHeader('Last Name', 'last_name', 'string')}
              {this.renderHeader('First Name', 'first_name', 'string')}
              {this.renderHeader('Absences', 'absences', 'number')}
            </tr>
          </thead>
          <tfoot>
            <tr>
              <td width="66.66%">{'Total: '}</td>
              <td width="33.33%">{this.totalAbsences()}</td>
            </tr>
          </tfoot>
          <tbody>
            {this.orderedRows().map(student => {
              return (
                <tr>
                  <td>{student.last_name}</td>
                  <td>{student.first_name}</td>
                  <td>{student.absences}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  },

  renderHeader (caption, sortBy, sortType) {
    return (
      <th onClick={this.onClickHeader.bind(null, sortBy, sortType)}
          className={this.headerClassName(sortBy)}>
        {caption}
      </th>
    );
  },

  renderCaption () {
    return this.props.selectedHomeroom ? this.props.selectedHomeroom : "All Students";
  }

});
