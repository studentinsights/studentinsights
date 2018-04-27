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
import { Column, Table } from 'react-virtualized'

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
    this.rowStyle = this.rowStyle.bind(this);
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
    const list = this.orderedRows();

    return (
      <div className='StudentsList'>
        <div className='caption'>
          {this.renderCaption()}
          <DashResetButton clearSelection={this.props.resetFn} selectedCategory={this.props.selectedCategory}/>
        </div>
        <Table
          width={500}
          height={500}
          headerHeight={20}
          rowHeight={30}
          rowCount={list.length}
          rowGetter={({index}) => list[index]}
          style={{fontSize: 14}}
          rowStyle={this.rowStyle}
        >
          <Column
            label='Name'
            dataKey='last_name'
            width={300}
          />
          <Column
            width={100}
            label='Grade'
            dataKey='grade'
          />
          <Column
            width={100}
            label='Events'
            dataKey='events'
          />
          <Column
            width={100}
            label='Last SST'
            dataKey='last_sst_date_text'
          />
        </Table>
        <div>{'Total: '}</div>
        <div>{this.totalEvents()}</div>
      </div>
    );
  }

  rowStyle({index}) {
    if (index < 0) {
      return;
    } else {
      return index % 2 === 0
        ? null
        : { backgroundColor: '#fafafa' };
    }
  }

  renderCaption() {
    const {selectedCategory} = this.props;

    return selectedCategory ? selectedCategory : 'All Students';
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
