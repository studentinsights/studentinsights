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
      sortBy: 'ca_attendance',
      sortType: 'number',
      sortDesc: true
    };

    this.onTableSort = this.onTableSort.bind(this);
    this.renderStudent = this.renderStudent.bind(this);
    this.renderRowStyle = this.renderRowStyle.bind(this);
    this.renderLastEventNote = this.renderLastEventNote.bind(this);
    this.renderNumberRight = this.renderNumberRight.bind(this);
    this.renderCA = this.renderCA.bind(this);
    this.renderRecover = this.renderRecover.bind(this);
    this.renderRight = this.renderRight.bind(this);
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
      event_count: 'number',
      latest_note: 'latest_note_date',
      // sc: 'number',
      // sca: 'number',
      ca: 'number',
      ma: 'number',
      ca_attendance: 'number',
      recent_ca: 'number',
      recover: 'number',
      total: 'number',
      since_note: 'number'
    }[sortBy];
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    const count = this.renderCount();
    const text = `${count} of ${this.props.rows.length} students`;
    return (
      <div className="StudentsTable" style={styles.root}>
        <div style={{flex: 1}}>
          {this.renderTableWithSizing()}
        </div>
        <div style={styles.totalEvents}>{`Chronically absent: ${text}`}</div>
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
          width={160}
        />
        {/*<Column
          width={50}
          label='Grade'
          dataKey='grade'
          cellRenderer={this.renderNumberRight}
        />*/}
        {/* new! */}
        {/*
        <Column
          width={60}
          label="%45"
          dataKey='ca'
          cellRenderer={this.renderCA}
        />
        <Column
          width={60}
          label="%yr"
          dataKey='ma'
          cellRenderer={this.renderCA}
        />
        */}
        {/*<Column
          width={70}
          label="Total"
          dataKey='total'
          cellRenderer={this.renderNumberRight}
        />*/}
        {/*<Column
          width={70}
          label="Days ago"
          dataKey='days_ago'
          cellRenderer={this.renderNumberRight}
        />*/}
        {/*<Column
          width={80}
          label={incidentType}
          dataKey='event_count'
          cellRenderer={this.renderNumberRight}
        />
        <Column
          width={70}
          label="Run"
          dataKey='school_days_run'
          cellRenderer={this.renderNumberRight}
        />*/}
        <Column
          width={65}
          label="Yearly"
          dataKey='ca_attendance'
          cellRenderer={this.renderCA.bind(this, {color: 'darkorange'})}
        />
        <Column
          width={115}
          label="Days needed"
          dataKey='recover'
          cellRenderer={this.renderRecover}
        />
        <Column
          width={130}
          style={{textAlign: 'right'}}
          label='Last note'
          dataKey='latest_note'
          cellRenderer={this.renderLastEventNote}
        />
        <Column
          width={65}
          label="Recently"
          dataKey='recent_ca'
          cellRenderer={this.renderCA.bind(this, {color: 'darkorange', fontWeight: 'bold'})}
        />
        {/*<Column
          width={70}
          label="Since note"
          dataKey='since_note'
          cellRenderer={this.renderNumberRight}
        />*/}
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

  renderNumberRight({cellData}) {
    return this.renderRight(cellData);
  }

  renderCA(style, {cellData}) {
    const percentageText = Math.round(cellData * 100) + '%';
    return this.renderRight((Math.round(cellData * 100) >= 10) // rounding
      ? <span style={style}>{percentageText}</span>
      : <span style={{color: '#999'}}>{percentageText}</span>);
  }

  renderRecover({rowData, cellData}) {
    const schoolDaysLeft = 180 - rowData.school_days_count;
    const recoveryDaysCount = cellData;
    const recoveryDaysText = recoveryDaysCount && recoveryDaysCount > 0
      ? recoveryDaysCount
      : null;
    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        {(recoveryDaysCount > schoolDaysLeft)
          ? <span style={{color: 'red'}}>{recoveryDaysText}</span>
          : <span style={{color: '#999'}}>{recoveryDaysText}</span>
        }
      </div>
    );
  }

  renderRight(children) {
    return (
      <div style={{width: '100%', textAlign: 'right', paddingRight: 15}}>
        {children}
      </div>
    );
  }

  renderLastEventNote({rowData}) {
    const latestNote = rowData.latest_note;
    if (!latestNote || !latestNote.recorded_at) return null;

    const {nowFn} = this.context;
    const noteTypeText = eventNoteTypeTextMini(latestNote.event_note_type_id);
    const lastNoteMoment = moment.utc(latestNote.recorded_at);


    const daysAgo = nowFn().diff(lastNoteMoment, 'days');
    const isOld = (daysAgo > 45);
    const style = (isOld)
      ? {
        color: '#ccc',
        display: 'inline-block',
        textAlign: 'center',
        padding: 4,
        fontSize: 12,
        height: '95%'
      }
      : {
        color: 'white',
        backgroundColor: 'rgb(74, 143, 225)',
        display: 'inline-block',
        textAlign: 'center',
        padding: 4,
        fontSize: 12,
        height: '95%'
      };
    return (
      <div style={{paddingRight: 10, display: 'flex', justifyContent: 'space-between'}}>
        <div style={{...style, width: '95%', display: 'flex', justifyContent: 'space-between'}}>
          <span>{noteTypeText}</span>
          {this.renderDaysAgo(lastNoteMoment, nowFn())}
        </div>
      </div>
    );
  }

  renderDaysAgo(lastNoteMoment, now) {
    const daysAgo = now.diff(lastNoteMoment, 'days');
    const isOld = (daysAgo > 45);
    const text = (isOld)
      ? `${now.diff(lastNoteMoment, 'weeks')} weeks`
      : `${daysAgo} days`;

    return <span>{text}</span>;
  }

  renderCount() {
    return this.props.rows.filter(row => {
      return Math.round(row.ca_attendance * 100) >= 10;
    }).length;
  }
}
StudentsTable.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
StudentsTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired,
    event_count: PropTypes.number.isRequired,
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
    paddingTop: 10,
    fontSize: 14
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