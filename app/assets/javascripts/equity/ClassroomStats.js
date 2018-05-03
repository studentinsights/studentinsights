import React from 'react';
import _ from 'lodash';
import Bar from '../components/Bar';
import BoxAndWhisker from '../components/BoxAndWhisker';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import {studentsInRoom} from './studentIdsByRoomFunctions';


// This component is written particularly for Somerville and it's likely this would require factoring out
// into `PerDistrict` to respect the way this data is stored across districts.
export default class ClassroomStats extends React.Component {
  studentsInRoom(room) {
    const {students, studentIdsByRoom} = this.props;
    return studentsInRoom(students, studentIdsByRoom, room.roomKey);
  }

  render() {
    const {rooms, gradeLevelNextYear} = this.props;

    // Show different academic indicators by grade level.  STAR starts in 2nd grade.
    const showStar = (['1', '2'].indexOf(gradeLevelNextYear) === -1);
    const showDibels = !showStar;
    return (
      <div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}></th>
              <th style={styles.cell}>Disability</th>
              <th style={styles.cell}>Limited English</th>
              <th style={styles.cell}>Gender (male)</th>
              <th style={styles.cell}>Students of color</th>
              <th style={styles.cell}>Low income</th>
              {showDibels && <th style={styles.cell}>Dibels CORE</th>}
              {showStar && <th style={styles.cell}>STAR Math</th>}
              {showStar && <th style={styles.cell}>STAR Reading</th>}
              <th style={styles.cell}>Discipline (>=3)</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {  
              return (
                <tr key={room.roomKey}>
                  <td style={styles.cell}>{room.roomName}</td>
                  <td style={styles.cell}>{this.renderDisability(room)}</td>
                  <td style={styles.cell}>{this.renderEnglishLearners(room)}</td>
                  <td style={styles.cell}>{this.renderGender(room)}</td>
                  <td style={styles.cell}>{this.renderStudentsOfColor(room)}</td>
                  <td style={styles.cell}>{this.renderLowIncome(room)}</td>
                  {showDibels && <td style={styles.cell}>{this.renderDibelsBreakdown(room)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderMath(room)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderReading(room)}</td>}
                  <td style={styles.cell}>{this.renderDiscipline(room)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderMath(room) {
    return this.renderStar(room, student => student.most_recent_star_math_percentile);
  }


  renderReading(room) {
    return this.renderStar(room, student => student.most_recent_star_reading_percentile);
  }

  renderStar(room, accessor) {
    const students = this.studentsInRoom(room);
    const values = _.compact(students.map(accessor));
    return (
      <div>
        {(values.length === 0)
          ? null
          : <BoxAndWhisker values={values} style={{width: 100, marginLeft: 'auto', marginRight: 'auto'}} />}
      </div>
    );
  }

  renderDiscipline(room) {
    return this.renderBarFor(room, student => {
      return (student.most_recent_school_year_discipline_incidents_count >= 3);
    });
  }

  renderDibelsBreakdown(room) {
    const students = this.studentsInRoom(room);
    const dibelsCounts = {
      strategic: 0,
      intensive: 0,
      core: 0
    };
    students.forEach(student => {
      if (!student.latest_dibels) return;
      const level = dibelsLevel(student.latest_dibels);
      dibelsCounts[level] = dibelsCounts[level] + 1;
    });

    return (
      <DibelsBreakdownBar
        coreCount={dibelsCounts.core}
        intensiveCount={dibelsCounts.intensive}
        strategicCount={dibelsCounts.strategic}
        height={5} />
    );
  }

  // If no score, consider them not core.
  renderDibelsCore(room) {
    return this.renderBarFor(room, student => {
      return (student.latest_dibels)
        ? student.latest_dibels.performance_level.toLowerCase().indexOf('core') !== -1
        : false;
    });
  }

  renderStudentsOfColor(room) {
    return this.renderBarFor(room, student => {
      return student.hispanico_latino || student.race.indexOf('White') === -1;
    });
  }

  renderGender(room) {
    return this.renderBarFor(room, student => {
      return student.gender === 'M';
    });
  }

  renderLowIncome(room) {
    return this.renderBarFor(room, student => {
      return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
    });
  }

  renderDisability(room) {
    return this.renderBarFor(room, student => student.disability !== null);
  }

  renderEnglishLearners(room) {
    return this.renderBarFor(room, student => student.limited_english_proficiency === 'Limited');
  }

  renderBarFor(room, filterFn) {
    const students = this.studentsInRoom(room);
    const count = students.filter(filterFn).length;
    const percent = count === 0
      ? 0 
      : Math.round(100 * count / students.length);

    return (
      <Bar
        percent={percent}
        threshold={5}
        style={styles.barStyle}
        innerStyle={styles.barInnerStyle} />
    );
  }

}
ClassroomStats.propTypes = {
  students: React.PropTypes.array.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired
};

const styles = {
  table: {
    width: '100%',
    textAlign: 'left',
    fontSize: 12,
    borderBottom: '1px solid #eee',
    padding: 20,
    tableLayout: 'fixed'
  },
  cell: { /* overridding some global CSS */
    textAlign: 'left',
    fontWeight: 'normal',
    fontSize: 12,
    verticalAlign: 'top'
  },
  barStyle: {
    background: 'white',
    fontSize: 10,
    position: 'relative',
    top: 4,
    borderTop: '2px solid #999'
  },
  barInnerStyle:{
    justifyContent: 'flex-start',
    padding: 2,
    color: '#ccc'
  }
};


function dibelsLevel(dibels) {
  const performanceLevel = dibels.performance_level.toLowerCase();
  if (performanceLevel.indexOf('core') !== -1) return 'core';
  if (performanceLevel.indexOf('strategic') !== -1) return 'strategic';
  if (performanceLevel.indexOf('intensive') !== -1) return 'intensive';
  return null;
}