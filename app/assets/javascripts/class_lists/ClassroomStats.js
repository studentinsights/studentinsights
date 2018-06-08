import React from 'react';
import _ from 'lodash';
import Hover from '../components/Hover';
import Stack from '../components/Stack';
import BoxAndWhisker from '../components/BoxAndWhisker';
import DibelsBreakdownBar from '../components/DibelsBreakdownBar';
import BreakdownBar from '../components/BreakdownBar';
import {
  selection,
  steelBlue,
  high,
  medium,
  low,
  male,
  female,
  nonBinary
} from '../helpers/colors';
import {studentsInRoom} from './studentIdsByRoomFunctions';
import {
  isLimitedOrFlep,
  isIepOr504,
  isLowIncome,
  isHighDiscipline,
  dibelsLevel,
  starBucket,
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

  isFlagSet(flagKey) {
    return (window.location.search.indexOf(flagKey) !== -1);
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
    const {rooms, gradeLevelNextYear} = this.props;

    // Show different academic indicators by grade level.  STAR starts in 2nd grade.
    const showStar = (['1', '2'].indexOf(gradeLevelNextYear) === -1);
    const showDibels = !showStar;
    return (
      <div className="ClassroomStats" style={styles.root} onKeyPress={this.onKeyPress}>
        <div style={styles.overlayMask}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.cell}></th>
                {this.renderHeaderCell({
                  label: 'IEP or 504',
                  columnHighlightKey: HighlightKeys.IEP_OR_504,
                  title: 'Students who have an IEP or 504 plan.'
                })}
                {this.renderHeaderCell({
                  label: 'Limited or FLEP',
                  columnHighlightKey: HighlightKeys.LIMITED_OR_FLEP,
                  title: 'Students receiving English Learning Services or who have in the past (FLEP).'
                })}
                {this.renderHeaderCell({
                  label: 'Gender identity',
                  columnHighlightKey: HighlightKeys.GENDER,
                  title: 'Students broken down by whether they identify their gender as male, female or nonbinary.'
                })}
                {this.renderHeaderCell({
                  label: 'Reduced lunch',
                  columnHighlightKey: HighlightKeys.LOW_INCOME,
                  title: 'Students whose are enrolled in the free or reduced lunch program.'
                })}
                {this.renderHeaderCell({
                  label: 'Discipline, 3+',
                  columnHighlightKey: HighlightKeys.HIGH_DISCIPLINE,
                  title: 'Students who had three or more discipline incidents of any kind during this past school year.  Discipline incidents vary in severity; click on the student\'s name to see more in their profile.'
                })}
                {showDibels && this.renderHeaderCell({
                  label: 'Dibels CORE',
                  columnHighlightKey: HighlightKeys.DIBELS,
                  title: 'Students\' latest DIBELS scores, broken down into Core (green), Strategic (orange) and Intensive (red).'
                })}
                {showStar && this.renderHeaderCell({
                  label: 'STAR Math',
                  columnHighlightKey: HighlightKeys.STAR_MATH,
                  title: 'A boxplot showing the range of students\' latest STAR Math percentile scores.  The number represents the median score.  When clicking, green represents students above the 70th percentile and red represents students below the 30th percentile.'
                })}
                {showStar && this.renderHeaderCell({
                  label: 'STAR Reading',
                  columnHighlightKey: HighlightKeys.STAR_READING,
                  title: 'A boxplot showing the range of students\' latest STAR Reading percentile scores.  The number represents the median score.  When clicking, green represents students above the 70th percentile and red represents students below the 30th percentile.'
                })}
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
      </div>
    );
  }

  // This enables a column overlay, which enables hover styling to see this is clickable,
  // showing a `title` on longer hovers, and clicking to toggle whether the column is selected.
  renderHeaderCell({title, label, columnHighlightKey}) {
    const {onCategorySelected, highlightKey} = this.props;
    return (    
      <th
        style={{...styles.cell, ...styles.heading}}
        title={title}
        onClick={() => {
          const nextHighlightKey = (columnHighlightKey !== highlightKey)
            ? columnHighlightKey
            : null;
          onCategorySelected(nextHighlightKey);
        }}>
        {this.renderColumnOverlay(columnHighlightKey)}
        {label}
      </th>
    );
  }

  // This renders an overlay over the column (by positioning relative to the 
  // header cell, then clipping overflows with the divs that contain the table.
  // It responds to hover and selection for styling.
  renderColumnOverlay(columnHighlightKey) {
    const {highlightKey} = this.props;
    const isSelected = (columnHighlightKey === highlightKey);
    return (
      <Hover>{isHovering => {
        const style = {
          ...styles.categoryOverlay,
          ...(isHovering ? styles.hoverCategoryOverlay : {}),
          ...(isSelected ? styles.selectedCategoryOverlay : {})
        };
        return <div style={style} />;
      }}</Hover>
    );
  }

  renderIepOr504(studentsInRoom) {
    const count = studentsInRoom.filter(isIepOr504).length;
    return this.renderStackSimple(count);
  }

  renderEnglishLearners(studentsInRoom) {
    const count = studentsInRoom.filter(isLimitedOrFlep).length;
    return this.renderStackSimple(count);
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
    return (
      <BreakdownBar
        items={items}
        style={styles.breakdownBar}
        innerStyle={styles.breakdownBarInner}
        height={5}
        labelTop={5} />
    );
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
    return this.renderStar(studentsInRoom, student => student.most_recent_star_math_percentile);
  }

  renderReading(studentsInRoom) {
    return this.renderStar(studentsInRoom, student => student.most_recent_star_reading_percentile);
  }

  renderStar(studentsInRoom, accessor) {
    return (this.isFlagSet('box-and-whisker'))
      ? this.renderStarWithBoxAndWhisker(studentsInRoom, accessor)
      : this.renderStarWithBreakdown(studentsInRoom, accessor);
  }

  // Ignore students without scores
  renderStarWithBreakdown(studentsInRoom, accessor) {
    const counts = _.countBy(studentsInRoom, student => starBucket(accessor(student)));
    const lowCount = counts.low || 0;
    const mediumCount = counts.medium || 0;
    const highCount = counts.high || 0;

    const items = [
      { left: 0, width: highCount, color: high, key: 'high' },
      { left: highCount, width: mediumCount, color: medium, key: 'medium' },
      { left: highCount + mediumCount, width: lowCount, color: low, key: 'low' }
    ];
    return (
      <BreakdownBar
        items={items}
        style={styles.breakdownBar}
        innerStyle={styles.breakdownBarInner}
        height={5}
        labelTop={5} />
    );
  }

  renderStarWithBoxAndWhisker(studentsInRoom, accessor) {
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
    paddingTop: 10,
    paddingBottom: 10,
    borderBottom: '1px solid #eee',
    fontSize: 14
  },
  overlayMask: { /* this is tweaking the clipping on the column overlay so padding looks right */
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 5,
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
    paddingBottom: 10,
    // for the column overlay
    position: 'relative',
    overflow: 'visible'
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
    backgroundColor: selection,
    padding: 4,
    paddingRight: 15,
    paddingLeft: 15,
    fontWeight: 'bold',
    color: '#333',
    cursor: 'pointer'
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: '-10em', // shooting past the number of rows there could be
    width: '100%',
    left: -5, // essentially padding
    top: -10,
    zIndex: 10, // so that this is clickable in front of the table contents
    borderRadius: 3  // even though this doesn't show on the bottom, since we don't know the height and are clipped
  },
  selectedCategoryOverlay: {
    background: steelBlue,
    borderRight: `5px solid ${steelBlue}`,
    opacity: 0.4,
  },
  hoverCategoryOverlay: {
    background: steelBlue,
    borderRight: `5px solid ${steelBlue}`,
    opacity: 0.1,
  }
};

