import React from 'react';
import _ from 'lodash';
import Bar from '../components/Bar';
import {colors} from '../helpers/Theme';

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
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Homeroom</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Size</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Disability</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Limited English</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Low income</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Racial composition</th>
                <th title="Not white or Hispanic" style={{cursor: 'help', padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Students of color</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Hispanic</th>
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
                  colorPercent
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
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={disabilityPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lepPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={lunchPercent} styles={styles.bar} threshold={10} />
                    </td>
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
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={colorPercent} styles={styles.bar} threshold={10} />
                    </td>
                    <td style={{height: '100%', width: 140, padding: 5}}>
                      <Bar percent={hispanicPercent} styles={styles.bar} threshold={10} />
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
