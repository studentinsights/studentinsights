import React from 'react';
import _ from 'lodash';
import Stack from '../components/Stack';
import BoxAndWhisker from '../components/BoxAndWhisker';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import BreakdownBar from '../components/BreakdownBar';
import {colors} from '../helpers/Theme';
import {studentsInRoom} from './studentIdsByRoomFunctions';
import {
  steelBlue,
  male,
  female,
  nonBinary
} from './colors.js';
import {
  isLimitedOrFlep,
  isIepOr504,
  isLowIncome,
  isHighDiscipline,
  HighlightKeys
} from './studentFilters';


// This component is written particularly for Somerville and it's likely this would require factoring out
// into `PerDistrict` to respect the way this data is stored across districts.
export default class ClassroomStats extends React.Component {
  constructor(props) {
    super(props);
    this.renderLabelFn = this.renderLabelFn.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  studentsInRoom(room) {
    const {students, studentIdsByRoom} = this.props;
    return studentsInRoom(students, studentIdsByRoom, room.roomKey);
  }

  onKeyPress(e) {
    const {onCategorySelected} = this.props;
    if (e.charCode === 27) return onCategorySelected(null);
  }

  render() {
    const {rooms, gradeLevelNextYear, highlightKey} = this.props;

    // Show different academic indicators by grade level.  STAR starts in 2nd grade.
    const showStar = (['1', '2'].indexOf(gradeLevelNextYear) === -1);
    const showDibels = !showStar;
    return (
      <div className="ClassroomStats" style={styles.root} onKeyPress={this.onKeyPress}>
        {highlightKey && this.renderSelectable(null, <div style={styles.clear}>Clear</div>, {position: 'relative'})}
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.cell}></th>
              <th style={{...styles.cell, ...styles.heading}} title="Students who have an IEP or 504 plan">
                {this.renderSelectable(HighlightKeys.IEP_OR_504, 'IEP or 504')}
              </th>
              <th style={{...styles.cell, ...styles.heading}} title="Students receiving English Learning Services or who have in the past (FLEP)">
                {this.renderSelectable(HighlightKeys.LIMITED_OR_FLEP, 'Limited or FLEP')}
              </th>
              <th style={{...styles.cell, ...styles.heading}} title="Students broken down by whether they identify their gender as male, female or nonbinary.">
                {this.renderSelectable(HighlightKeys.GENDER, 'Gender')}
              </th>
              <th style={{...styles.cell, ...styles.heading}} title="Students whose are enrolled in the free or reduced lunch program">
                {this.renderSelectable(HighlightKeys.LOW_INCOME, 'Low income')}
              </th>
              <th style={{...styles.cell, ...styles.heading}} title="Students who had three or more discipline incidents of any kind during this past school year.  Discipline incidents vary in severity; click on the student's name to see more in their profile.">
                {this.renderSelectable(HighlightKeys.HIGH_DISCIPLINE, 'Discipline, 3+')}
              </th>
              {showDibels &&
                <th style={{...styles.cell, ...styles.heading}} title="Students' latest DIBELS scores, broken down into Core (green), Strategic (orange) and Itensive (red)">
                  Dibels CORE
                </th>}
              {showStar &&
                <th style={{...styles.cell, ...styles.heading}} title="A boxplot showing the range of students' latest STAR Math percentile scores.  The number represents the median score.">
                  {this.renderSelectable(HighlightKeys.STAR_MATH, 'STAR Math')}
                </th>}
              {showStar &&
                <th style={{...styles.cell, ...styles.heading}} title="A boxplot showing the range of students' latest STAR Reading percentile scores.  The number represents the median score.">
                  {this.renderSelectable(HighlightKeys.STAR_READING, 'STAR Reading')}
                </th>}
              <th style={{...styles.cell, width: 50}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {  
              const studentsInRoom = this.studentsInRoom(room);
              return (
                <tr key={room.roomKey}>
                  <td style={styles.cell}>{room.roomName}</td>
                  <td style={styles.cell}>{this.renderIepOr504(studentsInRoom)}</td>
                  <td style={styles.cell}>{this.renderEnglishLearners(studentsInRoom)}</td>
                  <td style={styles.cell}>{this.renderGender(studentsInRoom)}</td>
                  <td style={styles.cell}>{this.renderLowIncome(studentsInRoom)}</td>
                  <td style={styles.cell}>{this.renderDiscipline(studentsInRoom)}</td>
                  {showDibels && <td style={styles.cell}>{this.renderDibelsBreakdown(studentsInRoom)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderMath(studentsInRoom)}</td>}
                  {showStar && <td style={styles.cell}>{this.renderReading(studentsInRoom)}</td>}
                  <td style={styles.cell}>{studentsInRoom.length > 0 &&
                    <span style={styles.total}>{studentsInRoom.length}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  renderSelectable(categoryKey, children, style = {}) {
    const {onCategorySelected} = this.props;
    return <div
      style={{...styles.selectable, ...style}}
      onClick={() => onCategorySelected(categoryKey)}>{children}</div>;
  }

  renderIepOr504(studentsInRoom) {
    const count = studentsInRoom.filter(isIepOr504).length;
    return this.renderSelectable(HighlightKeys.IEP_OR_504, this.renderStackSimple(count));
  }

  renderEnglishLearners(studentsInRoom) {
    const count = studentsInRoom.filter(isLimitedOrFlep).length;
    return this.renderSelectable(HighlightKeys.LIMITED_OR_FLEP, this.renderStackSimple(count));
  }

  renderGender(studentsInRoom) {
    const maleCount = studentsInRoom.filter(student => student.gender === 'M').length;
    const femaleCount = studentsInRoom.filter(student => student.gender === 'F').length;
    const nonBinaryCount = studentsInRoom.length - maleCount - femaleCount;
    const items = [
      { left: 0, width: maleCount, color: male, key: 'male' },
      { left: maleCount, width: femaleCount, color: female, key: 'female' },
      { left: maleCount + femaleCount, width: nonBinaryCount, color: nonBinary, key: 'nonbinary' }
    ];
    return this.renderSelectable(HighlightKeys.GENDER, (
      <BreakdownBar
        items={items}
        style={styles.breakdownBar}
        innerStyle={styles.breakdownBarInner}
        height={5}
        labelTop={5} />
    ));
  }

  renderLowIncome(studentsInRoom) {
    const count = studentsInRoom.filter(isLowIncome).length;
    return this.renderStackSimple(count);
  }

  renderDiscipline(studentsInRoom) {
    const count = studentsInRoom.filter(isHighDiscipline).length;
    return this.renderStackSimple(count);
  }

  renderDibelsBreakdown(studentsInRoom) {
    const students = studentsInRoom;
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
        style={styles.breakdownBar}
        innerStyle={styles.breakdownBarInner}
        height={5}
        labelTop={5} />
    );
  }

  renderMath(studentsInRoom) {
    return this.renderSelectable(HighlightKeys.STAR_MATH, this.renderStar(studentsInRoom, student => {
      return student.most_recent_star_math_percentile;
    }));
  }

  renderReading(studentsInRoom) {
    return this.renderSelectable(HighlightKeys.STAR_READING, this.renderStar(studentsInRoom, student => {
      return student.most_recent_star_reading_percentile;
    }));
  }

  renderStar(studentsInRoom, accessor) {
    const values = _.compact(studentsInRoom.map(accessor));
    return (
      <div>
        {(values.length === 0)
          ? null
          : <BoxAndWhisker
              values={values}
              style={styles.boxAndWhisker}
              labelStyle={styles.boxAndWhiskerLabel} />}
      </div>
    );
  }

  // This uses <Stack /> in a way different than intended, where it only
  // shows one bar, and positions the label to the right versus underneath.
  renderStackSimple(count) {
    const {students, rooms} = this.props;
    
    // tunable, this is a multiplier above the space an even split would take
    const scaleTuningFactor = (students.length / rooms.length) * 1.5;
    const stacks = [{ count, color: steelBlue }];
    return (
      <Stack
        stacks={stacks}
        style={styles.stackStyle}
        barStyle={styles.stackBarStyle} 
        labelStyle={styles.stackLabelStyle}
        scaleFn={count => count / scaleTuningFactor}
        labelFn={this.renderLabelFn} />
    );
  }

  renderLabelFn(count, stack, index) {
    if (count === 0) return '\u00A0';
    return <span style={{color: '#333'}}>{count}</span>;
  }
}
ClassroomStats.propTypes = {
  students: React.PropTypes.array.isRequired,
  gradeLevelNextYear: React.PropTypes.string.isRequired,
  rooms: React.PropTypes.array.isRequired,
  studentIdsByRoom: React.PropTypes.object.isRequired,
  highlightKey: React.PropTypes.string,
  onCategorySelected: React.PropTypes.func.isRequired
};

const styles = {
  root: {
    padding: 20,
    paddingBottom: 15,
    borderBottom: '1px solid #eee',
    fontSize: 14
  },
  table: {
    width: '100%',
    textAlign: 'left',
    tableLayout: 'fixed',
    borderCollapse: 'collapse'
  },
  cell: { /* overridding some global CSS */
    textAlign: 'left',
    fontWeight: 'normal',
    verticalAlign: 'top',
    overflow: 'hidden'
  },
  heading: {
    textDecoration: 'dashed #ccc underline',
    cursor: 'help',
    paddingBottom: 10
  },
  spacer: {
    width: 1
  },
  stackStyle: {
    paddingTop: 5,
    height: 20,
    marginBottom: 1
  },
  stackBarStyle: {
    height: 3
  },
  // Positions label to the right of bar
  stackLabelStyle: {
    fontSize: 12,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    position: 'relative',
    top: -6,
    left: 14
  },
  breakdownBar: {
    paddingTop: 4,
    paddingRight: 10
  },
  breakdownBarInner: {
    fontSize: 12
  },
  boxAndWhisker: {
    width: 100,
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  boxAndWhiskerLabel: {
    fontSize: 12
  },
  total: {
    color: '#999',
    float: 'right',
    fontSize: 12,
    paddingRight: 20
  },
  selectable: {
    height: '100%',
    width: '100%'
  },
  clear: {
    position: 'absolute',
    top: -3, // nudging it just above table bounds
    display: 'inline-block',
    backgroundColor: colors.selection,
    padding: 4,
    paddingRight: 15,
    paddingLeft: 15,
    fontWeight: 'bold',
    color: '#333',
    cursor: 'pointer'
  }
};


function dibelsLevel(dibels) {
  const performanceLevel = dibels.performance_level.toLowerCase();
  if (performanceLevel.indexOf('core') !== -1) return 'core';
  if (performanceLevel.indexOf('strategic') !== -1) return 'strategic';
  if (performanceLevel.indexOf('intensive') !== -1) return 'intensive';
  return null;
}
