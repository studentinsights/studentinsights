import React from 'react';
import _ from 'lodash';
import Bar from '../components/Bar';
import Stack from '../components/Stack';
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

  percentageInRoom(room, filterFn) {
    const students = this.studentsInRoom(room);
    const count = students.filter(filterFn).length;
    return count === 0
      ? 0 
      : Math.round(100 * count / students.length);
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
              <th style={styles.cell}>IEP or 504</th>
              <th style={styles.cell}>Limited or FLEP</th>
              <th style={styles.cell}>Gender (male)</th>
              <th style={styles.cell}>Low income</th>
              <th style={styles.cell}>Discipline (>=3)</th>
              {showDibels && <th style={styles.cell}>Dibels CORE</th>}
              {showStar && <th style={styles.cell}>STAR Math</th>}
              {showStar && <th style={styles.cell}>STAR Reading</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {  
              return (
                <tr key={room.roomKey}>
                  <td style={styles.cell}>{room.roomName}</td>
                  <td style={styles.cell}>{this.renderIepOr504(room)}</td>
                  <td style={styles.cell}>{this.renderEnglishLearners(room)}</td>
                  <td style={styles.cell}>{this.renderGender(room)}</td>
                  <td style={styles.cell}>{this.renderLowIncome(room)}</td>
                  <td style={styles.cell}>{this.renderDiscipline(room)}</td>
                  {showDibels && <td style={styles.cell}>{this.renderDibelsBreakdown(room)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderMath(room)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderReading(room)}</td>}
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
    const count = this.studentsInRoom(room).filter(student => {
      return (student.most_recent_school_year_discipline_incidents_count >= 3);
    }).length;
    return this.renderStackSimple(count);
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

  renderGender(room) {
    const count = this.studentsInRoom(room).filter(student => student.gender === 'M').length;
    return this.renderStackSimple(count);
  }

  renderLowIncome(room) {
    const count = this.studentsInRoom(room).filter(student => {
      return ['Free Lunch', 'Reduced Lunch'].indexOf(student.free_reduced_lunch) !== -1;
    }).length;
    return this.renderStackSimple(count);
  }

  renderIepOr504(room) {
    const count = this.studentsInRoom(room).filter(student => {
      return (student.disability !== null || student.plan_504 !== 'Not 504');
    }).length;
    return this.renderStackSimple(count);
  }

  renderDisability(room) {
    const count = this.studentsInRoom(room).filter(student => student.disability !== null).length;
    return this.renderStackSimple(count);
  }

  renderEnglishLearners(room) {
    const limitedCount = this.studentsInRoom(room).filter(student => student.limited_english_proficiency === 'Limited').length;
    const flepCount = this.studentsInRoom(room).filter(student => student.limited_english_proficiency === 'FLEP').length;
    return this.renderStackSimple(limitedCount + flepCount);

    // const stacks = [
    //   { count: limitedCount, color: '#999', key: 'limited' },
    //   { count: flepCount, color: '#ccc', key: 'flep' }
    // ];
    // return this.renderStackReal(stacks, {
    //   labelStyle: {
    //     width: 'auto'
    //   },
    //   labelFn(count, stack, index) {
    //     if (count === 0 || index !== 1) return '\u00A0';
    //     return (
    //        <span style={{position: 'relative', top: -8, paddingLeft: 15, color: 'red', opacity: 1.0}}>{limitedCount} + {flepCount}</span>
    //     );


    //     //       <span> + </span>
    //     //       <span style={{color: stack.color, opacity: 0.8}}>{flepCount}</span>
    //       // : <span style={{color: 'red', opacity: 1.0}}>{limitedCount} + {flepCount}</span>



    //     //       <span> + </span>
    //     //       <span style={{color: stack.color, opacity: 0.8}}>{flepCount}</span>


    //                   // : <span style={{color: stack.color, opacity: 0.8}}>{count}</span>;

    //     // return (count === 0 || index < stacks.length - 1)
    //     //   ? '\u00A0'
    //     //   : <span style={{
    //     //     // position: 'relative',
    //     //     // top: -5,
    //     //     // left: 12
    //     //   }}>
    //     //       <span style={{color: 'red', opacity: 1.0}}>{limitedCount} + {flepCount}</span>
    //     //       <span> + </span>
    //     //       <span style={{color: stack.color, opacity: 0.8}}>{flepCount}</span>
    //     //     </span>;
    //   }
    // });
  }

  renderStackSimple(count) {
    const stacks = [{ count, color: '#aaa' }];
    return this.renderStackReal(stacks, {
      labelStyle: {
        position: 'relative',
        top: -5,
        left: 12
      }
    });
  }

  renderStackReal(stacks, options = {}) {
    const magicScale = (this.props.students.length / this.props.rooms.length) * 1.5; // multiplier of even split
    return (
      <Stack
        stacks={stacks}
        style={{paddingTop: 5, height: 10, marginBottom: 1}}
        barStyle={{height: 3}} 
        labelStyle={{
          fontSize: 10,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          ...(options.labelStyle || {})
        }}
        scaleFn={count => count / magicScale}
        labelFn={options.labelFn || function(count, stack, index) {
          if (count === 0) return '\u00A0';
          const color = (count / magicScale > 1) ? 'red' : '#333';
          return <span style={{color}}>{count}</span>;
        }} />
    );
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
    verticalAlign: 'top',
    overflow: 'hidden'
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
    padding: 1,
    paddingBottom: 3,
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