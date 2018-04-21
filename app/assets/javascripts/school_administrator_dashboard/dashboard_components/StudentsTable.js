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
      <div className='StudentsList' style={style.root}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {this.renderCaption()}
          <DashResetButton clearSelection={this.props.resetFn} selectedCategory={this.props.selectedCategory}/>
        </div>
        <table className='students-list' style={style.table}>
          <thead style={style.thead}>
            <tr>
              <th style={style.th}
                  onClick={this.onClickHeader.bind(null, 'last_name', 'string')}
                  className={this.headerClassName('last_name')}>Name</th>
              <th style={style.th}
                  onClick={this.onClickHeader.bind(null, 'events', 'number')}
                  className={this.headerClassName('events')}>{this.props.incidentType}</th>
              <th style={style.th}
                  onClick={this.onClickHeader.bind(null, 'last_sst_date_text', 'date')}
                  className={this.headerClassName('last_sst_date_text')}>Last SST</th>
            </tr>
          </thead>
          <tbody style={style.tbody}>
            {this.orderedRows().map(student => {
              return (
                <tr key={student.id}>
                  <td style={style.td}>
                    <a href={Routes.studentProfile(student.id)}>
                      {student.first_name} {student.last_name}
                    </a>
                  </td>
                  <td style={style.td}>{student.events}</td>
                  <td style={style.td}>{student.last_sst_date_text}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={style.tfoot}>
            <tr>
              <td style={style.td}>{'Total: '}</td>
              <td style={style.td}>{this.totalEvents()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  }

  renderCaption() {
    const schoolYearCaption = this.props.schoolYearFlag? " (School Year)" : "";
    return this.props.selectedCategory ? this.props.selectedCategory + schoolYearCaption : "All Students" + schoolYearCaption;
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
  incidentType: PropTypes.string.isRequired, //Specific incident type being displayed
  resetFn: PropTypes.func.isRequired, //Function to reset student list to display all students
  schoolYearFlag: PropTypes.bool
};

const style = {
  root: {
    marginTop: 20
  },
  table: {
    width: '100%',
    border: '1px solid #ccc',
  },
  thead: {
    display: 'block',
    width: '100%',
  },
  tfoot: {
    display: 'block',
    width: '100%',
  },
  tbody: {
    display: 'block',
    width: '100%',
    height: 480,
    overflowY: 'scroll',
    borderTop: '1px solid #ccc',
    borderBottom: '1px solid #ccc',
  },
  td: {
    width: 150,
    textAlign: 'left',
  },
  th: {
    width: 150,
    textAlign: 'left',
  }
};

export default StudentsTable;
