import React from 'react';
import _ from 'lodash';
import Bar from '../components/Bar';
import {colors} from '../helpers/Theme';


// Compute range, excluding null and undefined values.
function range(students, accessor) {
  const filtered = students.filter(s => accessor(s) !== null && accessor(s) !== undefined);
  return [
    accessor(_.min(filtered, accessor)),
    accessor(_.max(filtered, accessor))
  ];
}

// Translate null values
function cleanNulls(students) {
  return students.map((student) => {
    return {
      ...student,
      race: (student.race) ? student.race : 'Unknown'
    };
  });
}

const orderedGrades = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ];

// Helpers
// Returns [{key, count}]
const countBy = function(students, key) {
  return _.map(_.groupBy(students, key), (students, value) => {
    return {[key]: value, count: students.length};
  });
};

// Returns {foo: count, bar: count}
const makeCountMap = function(students, key) {
  return countBy(students, key).reduce((map, item) => {
    map[item[key]] = item.count;
    return map;
  }, {});
};

// Returns [{key, count}], filling in zero values for `allValues`
// if they're not present.
const completeCountBy = function(students, key, allValues) {
  return allValues.map((value) => {
    const matches = _.where(students, { [key]: value });
    return { [key]: value, count: matches.length };
  });
};

// Returns percent as integer 0-100
const percentageOf = function(students, key, value) {
  const countMap = makeCountMap(students, key);
  const total = Object.keys(countMap).reduce((sum, key) => {
    return sum + countMap[key];
  }, 0);
  return (total === 0) ?
    0
    : 100 * (countMap[value] || 0) / total;
};

// Returns percent as integer 0-100
const percentageOverLimit = function(students, key, limit) {
  const values = students.map(student => student[key]);
  const total = values.length;
  const nonNull = values.filter(value => value !== null);

  const overLimitCount = nonNull.filter(value => value > limit).length;

  return (total === 0) ?
    0
    : 100 * overLimitCount / total;
};

const percentageUnderLimit = function(students, key, limit) {
  const values = students.map(student => student[key]);
  const total = values.length;
  const nonNull = values.filter(value => value !== null);

  const underLimitCount = nonNull.filter(value => value < limit).length;

  return (total === 0) ?
    0
    : 100 * underLimitCount / total;
};

const styles = {
  bar: {
    color: 'black',
    backgroundColor: '#ccc',
    borderLeft: '1px solid #aaa'
  }
};

export default class Breakdown extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      gradeFilter: _.first(orderedGrades)
    };

    this.onGradeClicked = this.onGradeClicked.bind(this);
  }

  onGradeClicked(grade) {
    this.setState({ gradeFilter: grade });
  }

  render() {
    // Clean and filter
    const {gradeFilter} = this.state;
    const rawStudents = this.props.students;
    const cleanedStudents = cleanNulls(rawStudents);
    const students = (gradeFilter === null)
      ? cleanedStudents
      : cleanedStudents.filter(student => student.grade === gradeFilter);
    const allRaces = _.sortBy(_.uniq(_.map(cleanedStudents, 'race')));

    // Compute
    const studentsByHomeroom = _.map(_.groupBy(students, 'homeroom_name'), (students, homeroomName) => {
      return {
        homeroomName,
        students,
        homeroomId: students[0].homeroom_id
      };
    });
    const statsForHomerooms = studentsByHomeroom.map(({homeroomName, homeroomId, students}) => {
      const grades = _.uniq(_.map(students, 'grade'));
      const raceGroups = completeCountBy(students, 'race', allRaces);
      const lunchMap = makeCountMap(students, 'free_reduced_lunch');
      const lunchPercent = 100 - percentageOf(students, 'free_reduced_lunch', 'Not Eligible');
      const hispanicPercent = percentageOf(students, 'hispanic_latino', true);
      const disabilityPercent = 100 - percentageOf(students, 'disability', null);
      const lepPercent = 100 - percentageOf(students, 'limited_english_proficiency', 'Fluent');
      const colorPercent = 100 * students.filter(s => s.hispanic_latino || s.race !== 'White').length / students.length;
      const overOneWeekAbsentPercent = percentageOverLimit(students, 'absences_count', 5);
      const overOneWeekTardyPercent = percentageOverLimit(students, 'tardies_count', 5);
      const hasDisciplinePercent = percentageOverLimit(students, 'discipline_incidents_count', 0);

      // Star Math
      const lowestQuartileStarMath = percentageUnderLimit(
        students, 'most_recent_star_math_percentile', 25);
      const highestQuartileStarMath = percentageOverLimit(
        students, 'most_recent_star_math_percentile', 75);
      const starMathPercentileRange = range(students, s => s.most_recent_star_math_percentile);

      // Star Reading
      const lowestQuartileStarReading = percentageUnderLimit(
        students, 'most_recent_star_reading_percentile', 25);
      const highestQuartileStarReading = percentageOverLimit(
        students, 'most_recent_star_reading_percentile', 75);
      const starReadingPercentileRange = range(students, s => s.most_recent_star_reading_percentile);

      return {
        homeroomName,
        homeroomId,
        grades,
        raceGroups,
        lunchMap,
        lunchPercent,
        disabilityPercent,
        lepPercent,
        hispanicPercent,
        colorPercent,
        overOneWeekAbsentPercent,
        overOneWeekTardyPercent,
        hasDisciplinePercent,
        lowestQuartileStarMath,
        highestQuartileStarMath,
        lowestQuartileStarReading,
        highestQuartileStarReading,
        starMathPercentileRange,
        starReadingPercentileRange,
        studentCount: students.length
      };
    });

    // Render
    // Keep colors consistent
    const color = d3.scale.ordinal()
      .domain(_.sortBy(allRaces, race => race.length))
      // .range(['#ffffe0','#ffcb91','#fe906a','#e75758','#c0223b','#8b0000']);
      // .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3']);
      .range(['#1b9e77','#d95f02','#7570b3','#e7298a','#66a61e','#e6ab02','#a6761d','#666666']);
    const sortedStatsForHomerooms = _.sortBy(statsForHomerooms, ({grades, studentCount}) => {
      if (grades.length === 1) return (100 * orderedGrades.indexOf(grades[0])) - studentCount;
      if (grades.length > 1) return -1000 - studentCount;
      return -2000 - studentCount;
    });

    return (
      <div style={{margin: 40}}>
        <div>
          {this.renderTitle('Select a grade')}
          <div style={{margin: 5}}>
            {orderedGrades.map((grade) => {
              return <button
                style={{
                  padding: 15,
                  paddingTop: 10,
                  paddingBottom: 10,
                  cursor: 'pointer',
                  margin: 3,
                  width: '5em',
                  border: '1px solid #ccc',
                  backgroundColor: (grade === gradeFilter) ? colors.selection : '#eee'
                }}
                key={grade}
                onClick={this.onGradeClicked.bind(this, grade)}>{grade}</button>;
            })}
          </div>
          <div style={{margin: 5}}>This excludes mixed grade homerooms.</div>
        </div>
        <div>
          {this.renderTitle('Compare across homeroom')}
          <table style={{width: '100%', margin: 5, marginTop: 10, borderCollapse: 'collapse'}}>
            <thead style={{borderBottom: '1px solid #999'}}>
              <tr>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Homeroom
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Size
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  > 5 Absences
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  > 5 Tardies
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  > 0 Discipline
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Disability
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Limited English
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Low income
                </th>

                <th title="Not white or Hispanic" style={{cursor: 'help', padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Students of color</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Hispanic</th>

                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  Racial composition
                </th>

                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Math<br/>Bottom Quartile
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Math<br/>Percentile range
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Math<br/>Top Quartile
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Reading<br/>Bottom Quartile
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Reading<br/>Percentile range
                </th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>
                  STAR Reading<br/>Top Quartile
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStatsForHomerooms.map((statsForHomeroom) => {
                const {
                  homeroomName,
                  homeroomId,
                  studentCount,
                  raceGroups,
                  lunchPercent,
                  hispanicPercent,
                  disabilityPercent,
                  lepPercent,
                  colorPercent,
                  overOneWeekAbsentPercent,
                  overOneWeekTardyPercent,
                  hasDisciplinePercent,
                  lowestQuartileStarMath,
                  highestQuartileStarMath,
                  lowestQuartileStarReading,
                  highestQuartileStarReading,
                  starMathPercentileRange,
                  starReadingPercentileRange
                } = statsForHomeroom;
                const total = _.map(raceGroups, 'count').reduce((sum, a) => {
                  return sum + a;
                }, 0);

                return (
                  <tr key={homeroomName} style={{marginBottom: 20}}>
                    <td style={{width: '5em', padding: 5}}>
                      <a href={`/homerooms/${homeroomId}`}>{homeroomName}</a>
                    </td>
                    <td style={{width: '3em', padding: 5}}>{studentCount}</td>

                    {/* Attendance / Discipline */}
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={overOneWeekAbsentPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={overOneWeekTardyPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={hasDisciplinePercent} styles={styles.bar} threshold={10} />
                    </td>

                    {/* Demographics */}
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={disabilityPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lepPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lunchPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={colorPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={hispanicPercent} styles={styles.bar} threshold={10} />
                    </td>

                    {/* Race */}
                    <td style={{padding: 5}}>
                      <div style={{flex: 1, width: 400, backgroundColor: 'white', height: '3em'}}>
                        {_.sortBy(raceGroups, 'race').map((group) => {
                          const {race, count} = group;
                          const percent = 100 * count / total;
                          const title = Math.round(percent) + '% ' + race;
                          if (percent === 0) return null;

                          return (
                            <Bar
                              key={race}
                              percent={percent}
                              threshold={10}
                              title={title}
                              styles={{backgroundColor: color(race)}}
                              innerStyles={{color: 'white'}} />
                          );
                        })}
                      </div>
                    </td>

                    {/* STAR */}
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lowestQuartileStarMath} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      {this.renderPercentileRangeBar(starMathPercentileRange)}
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={highestQuartileStarMath} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lowestQuartileStarReading} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      {this.renderPercentileRangeBar(starReadingPercentileRange)}
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={highestQuartileStarReading} styles={styles.bar} threshold={10} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div>
          {this.renderTitle('Color key')}
          <div style={{margin: 5}}>
            {allRaces.map((race) => {
              return <div key={race} style={{
                display: 'inline-block',
                margin: 10,
                color: 'white',
                padding: 5,
                backgroundColor: color(race)
              }}>{race}</div>;
            })}
          </div>
        </div>
      </div>
    );
  }

  renderPercentileRangeBar(range) {
    return (
      <div style={{position: 'relative', width: 100, backgroundColor: '#eee', height: 1}}>
        <div style={{position: 'absolute', background: '#eee', left: range[0], width: range[1] - range[0], height: 6, top: -1}}>{'\u00A0'}</div>
        <div style={{position: 'absolute', borderLeft: '1px solid #aaa', fontSize: 10, paddingLeft: 3, left: range[0], top: -5}}>{range[0]}</div>
        <div style={{position: 'absolute', borderLeft: '1px solid #aaa', fontSize: 10, paddingLeft: 3, left: range[1], top: -5}}>{range[1]}</div>
      </div>
    );
  }

  renderTitle(title) {
    return <div style={{marginTop: 50}}><b>{title}</b></div>;
  }

}

Breakdown.propTypes = {
  students: React.PropTypes.arrayOf(React.PropTypes.shape({
    race: React.PropTypes.string,
    disability: React.PropTypes.string,
    limited_english_proficiency: React.PropTypes.string,
    gender: React.PropTypes.string,
    grade: React.PropTypes.string,
    free_reduced_lunch: React.PropTypes.string,
    hispanic_latino: React.PropTypes.bool,
    homeroom_id: React.PropTypes.number,
    homeroom_name: React.PropTypes.string
  })).isRequired
};
