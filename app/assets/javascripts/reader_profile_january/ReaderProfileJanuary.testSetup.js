import React from 'react';
import hash from 'object-hash';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {toSchoolYear} from '../helpers/schoolYear';
import {adjustedGrade, howManyYears} from '../helpers/gradeText';
import {withNowContext} from '../testing/NowContainer';
import HelpBubble from '../components/HelpBubble';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {benchmarkPeriodKeyFor} from '../reading/readingData';
import {somervilleReadingThresholdsFor} from '../reading/thresholds';
import {
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH,
} from '../reading/thresholds';
import ReadingScheduleGrid, {gridParams} from '../reading/ReadingScheduleGrid';
import {readInstructionalStrategies} from './instructionalStrategies';
import ReaderProfileJanuary from './ReaderProfileJanuary';


export function renderTestGrid(testRuns) {
  return (
    <div className="ReaderProfileJanuary-testGrid" style={{display: 'flex', margin: 20}}>
      {testRuns.map(([nowString, cases]) => {
        const nowMoment = toMomentFromTimestamp(nowString);
        return (
          <div key={nowString} style={{marginBottom: 40}}>
            <h4 style={{color: '#999', marginBottom: 10}}>on {nowMoment.format('M/D/Y')}</h4>
            {cases.map((caseProps, index) => (
              <div key={index} style={{marginRight: 20, marginBottom: 20}}>
                <h2 style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                  <div>{caseProps.student.first_name}, {caseProps.student.grade}</div>
                  <HelpBubble
                    title={`Reading Schedule Grid: ${caseProps.student.first_name}`}
                    content={<ReadingScheduleGrid renderCellFn={(...params) => renderCellFn(caseProps, nowMoment, ...params)} />}
                    teaser='grid of scores'
                  />
                </h2>
                <div style={{width: 1000, border: '1px solid #333'}}>
                  {withNowContext(nowString, (
                    <PerDistrictContainer districtKey="somerville">
                      <ReaderProfileJanuary {...caseProps} />
                    </PerDistrictContainer>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function testRuns() {
  const times = [Nows.FALL, Nows.WINTER, Nows.SPRING];
  return times.map(nowString => [nowString, studentCases(nowString)]);
}

export function testProps(props) {
  return {
    student: {
      id: 12,
      first_name: 'Julius',
      grade: '5'
    },
    readerJson: {
      access: {},
      services: [],
      iep_contents: null,
      feed_cards: [],
      current_school_year: 2019,
      benchmark_data_points: []
    },
    instructionalStrategies: readInstructionalStrategies(),
    ...props
  };
}


function testAccess(beforeNowString, options = {}) {
  const dateTaken = toMomentFromTimestamp(beforeNowString).clone().subtract(35, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSZ');
  const performanceLevel = options.performanceLevel || '4';
  return {
    composite: {
      date_taken: dateTaken,
      performance_level: '6'
    },
    oral: {
      date_taken: dateTaken,
      performance_level: performanceLevel
    },
    listening: {
      date_taken: dateTaken,
      performance_level: performanceLevel
    },
    speaking: {
      date_taken: dateTaken,
      performance_level: performanceLevel
    },
    literacy: {
      date_taken: dateTaken,
      performance_level: '6'
    },
    reading: {
      date_taken: dateTaken,
      performance_level: '6'
    },
    comprehension: {
      date_taken: dateTaken,
      performance_level: '6'
    },
    writing: {
      date_taken: dateTaken,
      performance_level: '6'
    },
  };
}


function benchmark(params = {}) {
  return {
    "id": 999,
    "student_id": 777,
    "benchmark_school_year": 2018,
    "benchmark_period_key": 'fall', // _.sample(['fall', 'winter', 'spring']),
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": 35, // Math.round((10 + (Math.random() * 100)))  
    },
    "educator_id": 999999,
    "created_at": "2019-05-26T19:27:10.429Z",
    "updated_at": "2019-05-26T19:27:10.429Z",
    ...params
  };
}

function studentCases(nowString) {
  const defaultProps = testProps();
  return [
    deterministicSampleFor('Nikhil', 'KF', nowString, defaultProps, {percentMissing: 100}),
    deterministicSampleFor('Mari', 'KF', nowString, defaultProps),
    deterministicSampleFor('Alex', '1', nowString, defaultProps),
    deterministicSampleFor('Ryan', '2', nowString, {
      ...defaultProps,
      readerJson: {
        ...defaultProps.readerJson,
        access: testAccess(nowString, {performanceLevel: '6'})
      }
    }),
    deterministicSampleFor('Amir', '3', nowString, defaultProps),
    deterministicSampleFor('Matt', '4', nowString, defaultProps),
    deterministicSampleFor('Meena', '5', nowString, defaultProps),
  ];
}

const Nows = {
  FALL: '2018-09-19T11:03:06.123Z',
  WINTER: '2019-01-11T11:03:06.123Z',
  SPRING: '2018-05-15T11:03:06.123Z'
};


function renderCellFn(caseProps, nowMoment, benchmarkAssessmentKey, grade, benchmarkPeriodKey) {
  const {readerJson, student} = caseProps;
  const dataPoints = (readerJson.benchmark_data_points || []).filter(d => {
    if (d.benchmark_assessment_key !== benchmarkAssessmentKey) return false;
    if (d.benchmark_period_key !== benchmarkPeriodKey) return false;
    const gradeThen = adjustedGrade(d.benchmark_school_year, student.grade, nowMoment);
    if (gradeThen !== grade) return false;
    return true;
  });

  return (
    <div key={[grade, benchmarkAssessmentKey].join('-')} style={{color: '#666', textAlign: 'center', height: 80}}>
      {dataPoints.map((d, index) => <div key={index} style={{margin: 10}}>{d.json.value}</div>)}
    </div>
  );
}

function deterministicSampleFor(firstName, gradeNow, nowString, defaultProps, options = {}) {
  const id = parseInt(hash({firstName, gradeNow}), 16) % 1024;
  const benchmarkDataPoints = deterministicDataPointsSample(gradeNow, nowString, options);
  return testProps({
    student: {
      id,
      first_name: firstName,
      grade: gradeNow
    },
    readerJson: {
      ...defaultProps.readerJson,
      benchmark_data_points: benchmarkDataPoints
    }
  });
}


function deterministicDataPointsSample(gradeNow, nowString, options = {}) {
  const {benchmarkAssessmentKeys, benchmarkPeriodKeys, grades} = gridParams();

  // 1. What grades could have data?
  const pGrades = grades.slice(0, grades.indexOf(gradeNow) + 1);

  // 2. What (grades, periodKey) tuples could have data?
  const nowMoment = toMomentFromTimestamp(nowString);
  const nowPeriodKey = benchmarkPeriodKeyFor(nowMoment);
  const pCells = _.flatMap(pGrades, gradeThen => {
    const pBenchmarkPeriodKeys = (gradeThen === gradeNow)
      ? benchmarkPeriodKeys.slice(0, benchmarkPeriodKeys.indexOf(nowPeriodKey) + 1)
      : benchmarkPeriodKeys;
    return pBenchmarkPeriodKeys.map(periodKey => [gradeThen, periodKey]);
  });
  // console.log('pCells', pCells);

  // 3. What (assessmentKey, grade, periodKey) tuples could have data?
  // Base this off of the thresholds.
  const pTriples = _.flatMap(pCells, pCell => {
    const [gradeThen, benchmarkPeriodKey] = pCell;
    return _.compact(benchmarkAssessmentKeys.map(benchmarkAssessmentKey => {
      const thresholds = somervilleReadingThresholdsFor(...[
        benchmarkAssessmentKey,
        gradeThen,
        benchmarkPeriodKey
      ]);
      return (!thresholds) ? null : [benchmarkAssessmentKey, gradeThen, benchmarkPeriodKey];
    }));
  });
  // console.log('pTriples', pTriples);
    
  // 4. Sample values deterministically for those.
  const percentMissing = options.percentMissing || 0;
  const nowSchoolYear = toSchoolYear(nowMoment);
  const benchmarkDataPoints = _.compact(pTriples.map(triple => {
    if (parseInt(hash(triple), 16) % 100 < percentMissing) return null;

    const [benchmarkAssessmentKey, gradeThen, benchmarkPeriodKey] = triple;
    const years = howManyYears(gradeNow, gradeThen);
    const schoolYearThen = nowSchoolYear - years;
    const value = generateUnrealisticValue(benchmarkAssessmentKey);
    return benchmark({
      benchmark_school_year: schoolYearThen,
      benchmark_period_key: benchmarkPeriodKey,
      benchmark_assessment_key: benchmarkAssessmentKey,
      json: {value}
    });
  }));
  // console.log('benchmarkDataPoints', benchmarkDataPoints);
  return benchmarkDataPoints;
}


// Unrealistic data, only fits the type but nothing semantic.
function generateUnrealisticValue(benchmarkAssessmentKey) {
  if (benchmarkAssessmentKey === F_AND_P_SPANISH) return 'D';
  if (benchmarkAssessmentKey === F_AND_P_ENGLISH) return 'D';
  return '35';
}
