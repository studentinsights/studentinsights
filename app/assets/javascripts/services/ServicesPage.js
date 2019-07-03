import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {rankedByGradeLevel} from '../helpers/SortHelpers';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {gradeText} from '../helpers/gradeText';
import serviceColor from '../helpers/serviceColor';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import School from '../components/School';
import StudentPhotoCropped from '../components/StudentPhotoCropped';
import FilterServicesBar from './FilterServicesBar';


// Shows a list of services, for all students the educator works with.
export default class ServicesPage extends React.Component {
  componentDidMount() {
    updateGlobalStylesToTakeFullHeight();
  }

  render() {
    const url = `/api/educators/services_json`;
    return (
      <div className="ServicesPage" style={styles.flexVertical}>
        <GenericLoader
          promiseFn={() => apiFetchJson(url)}
          style={styles.flexVertical}
          render={json => (
            <ServicesView services={json.services} />
          )}
        />
      </div>
    );
  }
}


export class ServicesView extends React.Component {
  constructor(props) {
    super(props);
    
    this.state = {
      sortBy: 'name',
      sortDirection: SortDirection.ASC,
    };
    this.onTableSort = this.onTableSort.bind(this);
    this.renderName = this.renderName.bind(this);
    this.renderSchool = this.renderSchool.bind(this);
    this.renderTimeRange = this.renderTimeRange.bind(this);
  }

  orderedServices(services) {
    const {nowFn} = this.context;
    const {sortBy, sortDirection} = this.state;
    const nowMoment = nowFn();

    // map dataKey to an accessor/sort function
    const sortFns = {
      fallback(service) { return service[sortBy]; },
      student(service) { return `${service.student.last_name}, ${service.student.first_name}`; },
      school(service) { return service.student.school.name; },
      grade(service) { return rankedByGradeLevel(service.student.grade); },
      service(service) { return service.service_type.name; },
      educator(service) { return service.provided_by_educator_name; },
      start_date(service) { return timeRangeForService(service).startMoment.unix(); },
      end_date(service) {
        const {maybeEndMoment} = timeRangeForService(service);
        return (maybeEndMoment) ? maybeEndMoment.unix() : 0;
      },
      time_range(service) {
        const {startMoment, maybeEndMoment} = timeRangeForService(service);
        return (maybeEndMoment || nowMoment).diff(startMoment, 'days');
      }
    };
    const sortFn = sortFns[sortBy] || sortFns.fallback;
    const sortedRows = _.sortBy(services, sortFn);

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
    const {services} = this.props;

    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Services</SectionHeading>
        <FilterServicesBar
          services={services}
          style={{...styles.flexVertical, marginLeft: 10, marginTop: 20}}>
          {filteredServices => this.renderTable(filteredServices)}
        </FilterServicesBar>
      </div>
    );
  }

  renderTable(filteredServices) {
    const {sortDirection, sortBy} = this.state;
    const sortedServices = this.orderedServices(filteredServices);
    const rowHeight = 60; // for two lines of student names

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
            rowStyle={{display: 'flex', alignItems: 'center'}}
            style={{fontSize: 14}}
            rowHeight={rowHeight}
            rowCount={sortedServices.length}
            rowGetter={({index}) => sortedServices[index]}
            sort={this.onTableSort}
            sortBy={sortBy}
            sortDirection={sortDirection}
          >
            <Column
              label='Student'
              dataKey='student'
              cellRenderer={this.renderName}
              width={260}
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
              cellRenderer={this.renderGrade}
              width={100}
            />
            <Column
              label='Service'
              dataKey='service'
              cellRenderer={this.renderService}
              width={140}
            />
            <Column
              label='Provider'
              dataKey='educator'
              cellRenderer={this.renderEducator}
              width={80}
            />
            <Column
              label='Dates'
              dataKey='start_date'
              cellRenderer={this.renderStartDate}
              width={80}
            />
            <Column
              label=''
              dataKey='end_date'
              cellRenderer={this.renderEndDate}
              width={80}
            />
            <Column
              label={<span>Timeline,<br/>3 years</span>}
              dataKey='time_range'
              cellRenderer={this.renderTimeRange}
              width={160}
            />
          </Table>
        )}
      </AutoSizer>
    );
  }

  renderName(cellProps) {
    const {student} = cellProps.rowData;
    return (
      <div style={styles.nameBlock}>
        <a style={{fontSize: 14}} href={`/students/${student.id}`} target="_blank" rel="noopener noreferrer">{student.first_name} {student.last_name}</a>
        {student.has_photo && (
          <StudentPhotoCropped
            studentId={student.id}
            style={styles.photo}
          />
        )}
      </div>
    );
  }

  renderSchool(cellProps) {
    const {student} = cellProps.rowData;
    return <School {...student.school} style={{marginRight: 10}} />;
  }

  renderGrade(cellProps) {
    const {student} = cellProps.rowData;
    return gradeText(student.grade);
  }

  renderService(cellProps) {
    const service = cellProps.rowData;
    const wasDiscontinued = (service.discontinued_by_educator_id !== null);

    return (
      <div style={{
        background: serviceColor(service.service_type.id),
        opacity: (wasDiscontinued) ? 0.8 : 1,
        fontSize: 12,
        padding: 5,
        marginRight: 10
      }}>
        {service.service_type.name}
      </div>
    );
  }

  renderEducator(cellProps) {
    const service = cellProps.rowData;
    return service.provided_by_educator_name;
  }

  renderStartDate(cellProps) {
    const service = cellProps.rowData;
    const {startMoment, maybeEndMoment} = timeRangeForService(service);
    const color = (maybeEndMoment === null) ? 'black' : '#aaa';
    return (
      <div style={{textAlign: 'right'}}>
        <div style={{color}}>{`${startMoment.format('M/D/YY')} - `}</div>
      </div>
    );
  }

  renderEndDate(cellProps) {
    const service = cellProps.rowData;
    const {maybeEndMoment} = timeRangeForService(service);
    const color = (maybeEndMoment === null) ? 'black' : '#aaa';
    return (
      <div style={{textAlign: 'left', marginLeft: 5}}>
        <div style={{color}}>{maybeEndMoment ? maybeEndMoment.format('M/D/YY') : null}</div>
      </div>
    );
  }

  renderTimeRange(cellProps) {
    const {nowFn} = this.context;
    const service = cellProps.rowData;
    const {startMoment, maybeEndMoment} = timeRangeForService(service);
    const nowMoment = nowFn();
    return (
      <div>
        {this.renderTimeRangeBar(startMoment, maybeEndMoment, {
          nowMoment,
          nDaysBack: 365*3,
          width: 160
        })}
      </div>
    );
  }

  renderTimeRangeBar(startMoment, maybeEndMoment, options = {}) {
    const width = options.width;
    const nDaysBack = options.nDaysBack;
    const nowMoment = options.nowMoment;
    const startN = nowMoment.diff(startMoment, 'days');
    const endN = (maybeEndMoment === null) ? null : nowMoment.diff(maybeEndMoment, 'days');
    const nCalendarMonths = (maybeEndMoment || nowMoment).diff(startMoment, 'months');
    const nCalendarDays = (maybeEndMoment || nowMoment).diff(startMoment, 'days');
    const trueBarWidth = (nCalendarDays !== null)
      ? (nCalendarDays/nDaysBack)*width
      : (startN/nDaysBack)*width;
    const barWidth = Math.max(trueBarWidth, 5);
    return (
      <div style={{position: 'relative', background: '#f8f8f8', height: 20}}>
        <div title={`${nCalendarMonths} months, ${nCalendarDays} calendar days`} style={{
          position: 'absolute',
          left: ((nDaysBack - startN)/nDaysBack)*width,
          width: barWidth,
          top: 0,
          bottom: 0,
          backgroundColor: (endN) ? '#aaa' :'rgb(74, 143, 225)',
          fontSize: 10,
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>{trueBarWidth === barWidth ? `${nCalendarMonths}m` : null}</div>
      </div>
    );
  }
}
ServicesView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ServicesView.propTypes = {
  services: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    discontinued_by_educator_id: PropTypes.number,
    provided_by_educator_name: PropTypes.string,
    date_started: PropTypes.string,
    estimated_end_date: PropTypes.string,
    discontinued_at: PropTypes.string,
    service_type: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    }).isRequired,
    student: PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string,
      has_photo: PropTypes.bool.isRequired,
      school: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      }).isRequired,
      homeroom: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  })).isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  nameBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  photo: {
    display: 'inline-block',
    marginLeft: 20,
    marginRight: 20
  }
};

function timeRangeForService(service) {
  const discontinuedMoment = (service.discontinued_at === null)
    ? null
    : toMomentFromTimestamp(service.discontinued_at);
  const estimatedEndMoment = (service.estimated_end_date === null)
    ? null
    : toMomentFromTimestamp(service.estimated_end_date);
  const startedMoment = toMomentFromTimestamp(service.date_started);
  return {
    startMoment: startedMoment,
    maybeEndMoment: discontinuedMoment || estimatedEndMoment || null
  };
}