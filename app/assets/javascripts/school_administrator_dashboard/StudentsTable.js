import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import _ from 'lodash';
import {Column, Table, SortDirection} from 'react-virtualized';
import {AutoSizer} from 'react-virtualized';
import {
  sortByString,
  sortByNumber,
  sortByDate,
  sortByGrade
} from '../helpers/SortHelpers';
import * as Routes from '../helpers/Routes';
import * as InsightsPropTypes from '../helpers/InsightsPropTypes';
import {eventNoteTypeTextMini} from '../helpers/eventNoteType';


export default class StudentsTable extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      sortBy: 'events',
      sortType: 'number',
      sortDesc: true
    };

    this.onTableSort = this.onTableSort.bind(this);
    this.renderStudent = this.renderStudent.bind(this);
    this.renderRowStyle = this.renderRowStyle.bind(this);
    this.renderLastEventNote = this.renderLastEventNote.bind(this);
  }

  sortedRows() {
    const rows = _.sortBy(this.props.rows, row => row.id);
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
    case 'latest_note_date':
      return _.sortBy(rows, row => new Date(latestNoteTime(row)));
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
      latest_note: 'latest_note_date'
    }[sortBy];
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    return (
      <div className="StudentsTable" style={styles.root}>
        <div style={{flex: 1}}>
          {this.renderTableWithSizing()}
        </div>
        <div style={styles.totalEvents}>{`Total ${this.props.incidentType}:  ${this.renderTotalEvents()}`}</div>
      </div>
    );
  }

  renderTableWithSizing() {
    const {forcedSizeForTesting} = this.props;
    return (forcedSizeForTesting)
      ? this.renderTable(forcedSizeForTesting)
      : <AutoSizer>{({width, height}) => this.renderTable({width, height})}</AutoSizer>;
  }

  renderTable({width, height}) {
    const {incidentType} = this.props;
    const {sortBy, sortDesc} = this.state;
    const list = this.orderedRows();

    return (
      <Table
        style={styles.table}
        width={width}
        height={height}
        rowCount={list.length}
        rowGetter={({index}) => list[index]}
        headerHeight={25}
        headerStyle={{display: 'flex'}} // necessary for layout, not sure why
        rowHeight={25}
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
          width={150}
        />
        <Column
          width={50}
          label='Grade'
          dataKey='grade'
        />
        <Column
          width={80}
          label={incidentType}
          dataKey='events'
        />
        <Column
          width={150}
          style={{textAlign: 'right'}}
          label='Last note'
          dataKey='latest_note'
          cellRenderer={this.renderLastEventNote}
        />
      </Table>
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

  renderLastEventNote({rowData}) {
    const latestNote = rowData.latest_note;
    if (!latestNote || !latestNote.recorded_at) return null;

    const {nowFn} = this.context;
    const noteTypeText = eventNoteTypeTextMini(latestNote.event_note_type_id);
    const lastNoteMoment = moment.utc(latestNote.recorded_at);
    return (
      <div style={{paddingRight: 10, display: 'flex', justifyContent: 'space-between'}}>
        <span style={{color: '#999'}}>{noteTypeText}</span>
        {this.renderDaysAgo(lastNoteMoment, nowFn())}
      </div>
    );
  }

  renderDaysAgo(lastNoteMoment, now) {
    const daysAgo = now.diff(lastNoteMoment, 'days');
    const isOld = (daysAgo > 45);
    const text = (isOld)
      ? `${now.diff(lastNoteMoment, 'weeks')} weeks`
      : `${daysAgo} days`;
    const color = (isOld)
      ? '#ccc'
      : 'black';
    return <span style={{color}}>{text}</span>;
  }

  renderTotalEvents() {
    let total = 0;
    this.props.rows.forEach((student) => {
      total += student.events;
    });
    return total;
  }
}
StudentsTable.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentsTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    events: PropTypes.number.isRequired,
    latest_note: InsightsPropTypes.nullableWithKey(PropTypes.object)
  })).isRequired,
  incidentType: PropTypes.string.isRequired, // Specific incident type being displayed
  forcedSizeForTesting: PropTypes.object
};


function fullName(student) {
  return`${student.first_name} ${student.last_name}`;
}

function fullNameReverse(student) {
  return`${student.last_name}, ${student.first_name}`;
}

function latestNoteTime(student) {
  return student.latest_note && student.latest_note.recorded_at;
}

const styles = {
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    marginBottom: 10
  },
  table: {
    fontSize: 14
  },
  totalEvents: {
    paddingTop: 10
  },
  caption: {
    display: 'flex',
    fontSize: 14,
    justifyContent: 'flex-start',
    paddingBottom: 5
  },
  incidentSubtitle: {
    fontWeight: 'normal',
    fontSize: 12
  },
  truncatedLink: {
    display: 'inline-block',
    width: '100%',
    whiteSpace: 'nowrap',
    overflowX: 'hidden',
    textOverflow: 'ellipsis'
  }
};