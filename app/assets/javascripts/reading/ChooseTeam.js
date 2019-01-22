import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _ from 'lodash';
import {prettySchoolYearText} from '../helpers/schoolYear';
import {gradeText} from '../helpers/gradeText';
import Button from '../components/Button';


export default function ChooseTeam(props = {}) {
  const {isEditable, teams, team, onTeamChanged, onDone} = props;
  const {schoolId, grade, benchmarkSchoolYear, benchmarkPeriodKey} = team;
  const isDisabled = (
    schoolId === null ||
    grade === null ||
    benchmarkSchoolYear === null ||
    benchmarkPeriodKey === null
  );
  return (
    <div className="ChooseTeam">
      <div>
        <div style={styles.heading}>What school?</div>
        <Select
          disabled={!isEditable}
          name="select-school-name"
          value={schoolId}
          onChange={item => onTeamChanged({...team, schoolId: item.value})}
          options={_.sortBy(teams.schools, s => s.name).map(school => {
            return {
              value: school.id,
              label: school.name
            };
          })}
        />
      </div>
      <div>
        <div style={styles.heading}>What grade level are you creating?</div>
        <Select
          disabled={!isEditable}
          name="select-grade-level"
          value={grade}
          onChange={item => onTeamChanged({...team, grade: item.value})}
          options={teams.grades.map(grade => {
            return {
              value: grade,
              label: gradeText(grade)
            };
          })}
        />
      </div>
      <div>
        <div style={styles.heading}>What benchmark period?</div>
        <Select
          disabled={!isEditable}
          name="select-benchmark-window"
          value={[benchmarkSchoolYear, benchmarkPeriodKey].join(':')}
          onChange={item => {
            const pair = item.value.split(':');
            const benchmarkSchoolYear = parseInt(pair[0], 10);
            const benchmarkPeriodKey = pair[1];
            onTeamChanged({...team, benchmarkSchoolYear, benchmarkPeriodKey});
          }}
          options={_.sortBy(teams.benchmarkWindows, bw => parseInt(toDateText(bw), 10)).map(bw => {
            return {
              value: [bw.benchmark_school_year, bw.benchmark_period_key].join(':'),
              label: prettyBenchmarkText(bw)
            };
          })}
        />
      </div>
      <div style={{marginTop: 20}}>You can't change the school, grade level or benchmark window once you've moved forward.  If you need to change this, create a new grouping instead.</div>
      <div>
        <Button
          style={{marginTop: 20}}
          isDisabled={isDisabled}
          onClick={onDone}>Next</Button>
      </div>
    </div>
  );
}
ChooseTeam.propTypes = {
  isEditable: PropTypes.bool.isRequired,
  onTeamChanged: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  team: PropTypes.shape({
    schoolId: PropTypes.number,
    grade: PropTypes.string,
    benchmarkPeriodKey: PropTypes.string,
    benchmarkSchoolYear: PropTypes.number
  }).isRequired,
  teams: PropTypes.shape({
    schools: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })).isRequired,
    grades: PropTypes.arrayOf(PropTypes.string).isRequired,
    educators: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number.isRequired,
      full_name: PropTypes.string.isRequired
    })).isRequired,
    benchmarkWindows: PropTypes.arrayOf(PropTypes.shape({
      benchmark_school_year: PropTypes.number.isRequired,
      benchmark_period_key: PropTypes.string.isRequired
    })).isRequired
  }).isRequired
};


const styles = {
  heading: {
    marginTop: 20
  }
};


// for sorting
function toDateText(benchmarkWindow) {
  const monthText = {
    winter: '0101',
    fall: '0901',
    spring: '0501'
  }[benchmarkWindow.benchmark_period_key];
  return `${benchmarkWindow.school_year}${monthText}`;
}

function prettyBenchmarkText(benchmarkWindow) {
  const monthText = {
    winter: 'Winter',
    fall: 'Fall',
    spring: 'Spring'
  }[benchmarkWindow.benchmark_period_key];
  const schoolYearText = prettySchoolYearText(benchmarkWindow.benchmark_school_year);
  return `${monthText} ${schoolYearText}`;
}
