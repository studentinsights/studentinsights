import Bar from '../components/bar.jsx';

// Translate null values
const students = rawStudents.map((student) => {
  return {
    ...student,
    race: (student.race) ? student.race : 'Unknown'
  };
});


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
}

// Returns [{key, count}], filling in zero values for `allValues`
// if they're not present.
const completeCountBy = function(students, key, allValues) {
  return allValues.map((value) => {
    const matches = _.where(students, { [key]: value });
    return { [key]: value, count: matches.length };
  });
}

// Returns percent as integer 0-100
const percentageOf = function(students, key, value) {
  const countMap = makeCountMap(students, key);
  const total = Object.keys(countMap).reduce((sum, key) => {
    return sum + countMap[key];
  }, 0);
  return Math.round(100 * countMap[value] / total);
};
const LETTERS = _.range(65, 65 + 26).map(c => String.fromCharCode(c));
const codes = _.flatten(LETTERS.map((outer) => {
  return LETTERS.map((inner) => {
    return [outer, inner].join('');
  });
}));
const bucket = function(value, buckets) {
  return buckets[hashCode(value) % buckets.length];
}
const hashCode = function(s){
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
}


export default React.createClass({
    displayName: 'CohortBreakdown',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    getInitialState: function() {
      return {};
    },

    render: function() {
      // Compute
      const studentsByHomeroom = _.map(_.groupBy(students, 'homeroom_name'), (students, homeroomName) => {
        return {
          homeroomName,
          students,
          homeroomId: students[0].homeroom_id
        };
      });
      const allRaces = _.sortBy(_.uniq(_.map(students, 'race')));
      const statsForHomerooms = studentsByHomeroom.map(({homeroomName, homeroomId, students}) => {
        const grades = _.uniq(_.map(students, 'grade'));
        const raceGroups = completeCountBy(students, 'race', allRaces);
        const lunchMap = makeCountMap(students, 'free_reduced_lunch');
        const lunchPercent = 100 - percentageOf(students, 'free_reduced_lunch', 'Not Eligible');
        const hispanicPercent = percentageOf(students, 'hispanic_latino', true);
        return {
          homeroomName,
          homeroomId,
          grades,
          raceGroups,
          lunchMap,
          lunchPercent,
          hispanicPercent,
          studentCount: students.length
        };
      });


      // Render
      const color = d3.scale.category10();
      const orderedGrades = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ];
      const sortedStatsForHomerooms = _.sortBy(statsForHomerooms, ({grades}) => {
        if (grades.length === 1) return orderedGrades.indexOf(grades[0]);
        if (grades.length > 1) return -100;
        return -200;
      });


      return (
        <div style={{margin: 40}}>
          <div style={{marginBottom: 40}}>
            <b>Grades:</b>
            {orderedGrades.map((grade) => {
              return <button onClick={this.onGradeClicked.bind(this, grade)}>{grade}</button>;
            })}
          </div>
          <div style={{marginBottom: 40}}>
            <b>Race key</b>
            {allRaces.map((race) => {
              return <div key={race} style={{color: color(race)}}>{race}</div>;
            })}
          </div>
          <table id="equity-table" style={{borderCollapse: 'collapse', border: '1px solid #eee'}}>
            <thead style={{borderBottom: '1px solid #666'}}>
              <tr>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Grade</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Homeroom</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Size</th>
                {/*allRaces.map((race) => {
                  return <th key={race} style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>{race}</th>;
                })*/}
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Low income</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Hispanic</th>
                <th style={{padding: 5, textAlign: 'left', fontWeight: 'bold'}}>Racial composition</th>
              </tr>
            </thead>
            <tbody>
              {sortedStatsForHomerooms.map((statsForHomeroom) => {
                const {
                  homeroomName,
                  studentCount,
                  raceGroups,
                  grades,
                  lunchPercent,
                  hispanicPercent
                } = statsForHomeroom;
                const total = _.map(raceGroups, 'count').reduce((sum, a) => {
                  return sum + a; 
                }, 0);
                
                return (
                  <tr key={homeroomName}>
                    <td style={{width: '3em', padding: 5}}>{grades.join(', ')}</td>
                    <td style={{width: '5em', padding: 5}}>{bucket(homeroomName, codes)}</td>
                    <td style={{width: '3em', padding: 5}}>{studentCount}</td>
                    {/*_.sortBy(raceGroups, 'race').map((group) => {
                      const {race, count} = group;
                      const percent = 100 * count / total;
                      return (
                        <td key={race} style={{padding: 5}}>
                          <div style={{flex: 1, width: 100, backgroundColor: 'white', height: '4em'}}>
                            <Bar percent={percent} threshold={10} color={color(race)} />
                          </div>
                        </td>
                      );
                    })*/}
                    <td style={{width: 250, height: '100%', padding: 5}}>
                      <Bar percent={lunchPercent} color="darkgreen" threshold={10} />
                    </td>
                    <td style={{width: 250, height: '100%', padding: 5}}>
                      <Bar percent={hispanicPercent} color="darkblue" threshold={10} />
                    </td>
                    <td style={{padding: 5}}>
                      <div style={{flex: 1, width: 400, backgroundColor: 'white', height: '4em'}}>
                        {_.sortBy(raceGroups, 'race').map((group) => {
                          const {race, count} = group;
                          const percent = 100 * count / total;
                          return <Bar key={race} percent={percent} threshold={10} color={color(race)} />;
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }