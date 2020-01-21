import React from 'react';
import {storiesOf} from '@storybook/react';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {
  DIBELS_DORF_WPM,
  DIBELS_DORF_ACC,
  DIBELS_DORF_ERRORS,
  DIBELS_FSF,
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  F_AND_P_ENGLISH,
  F_AND_P_SPANISH,
  INSTRUCTIONAL_NEEDS
} from '../reading/thresholds';
import {readInstructionalStrategies} from './instructionalStrategies';
import ReaderProfileJanuary from './ReaderProfileJanuary';


function storyProps(props) {
  return {
    student: {
      id: 1,
      first_name: 'Mari',
      grade: 'KF'
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
  console.log('dateTaken', dateTaken);
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
    "benchmark_period_key": "fall",
    "benchmark_assessment_key": "f_and_p_english",
    "json": {
      "value": 35
    },
    "educator_id": 999999,
    "created_at": "2019-05-26T19:27:10.429Z",
    "updated_at": "2019-05-26T19:27:10.429Z",
    ...params
  };
}

function allBenchmarks(nowString, params = {}) {
  const benchmark_school_year = toMomentFromTimestamp(nowString).year();
  return [
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_DORF_WPM}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_DORF_ACC}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_DORF_ERRORS}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_FSF}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_LNF}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_PSF}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_NWF_CLS}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: DIBELS_NWF_WWR}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: F_AND_P_ENGLISH}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: F_AND_P_SPANISH}),
    benchmark({...params, benchmark_school_year, benchmark_assessment_key: INSTRUCTIONAL_NEEDS})
  ];
}
function studentCases(nowString) {
  const defaultProps = storyProps();
  const benchmarkDataPoints = allBenchmarks(nowString);
  return [
    storyProps({
      readerJson: {
        ...defaultProps.readerJson,
        benchmark_data_points: benchmarkDataPoints
      }
    }),
    storyProps({
      student: {
        id: 7,
        first_name: 'Alex',
        grade: '1'
      },
      readerJson: {
        ...defaultProps.readerJson,
        access: testAccess(nowString),
        benchmark_data_points: benchmarkDataPoints
      }
    }),
    storyProps({
      student: {
        id: 9,
        first_name: 'Ryan',
        grade: '2'
      },
      readerJson: {
        ...defaultProps.readerJson,
        access: testAccess(nowString, {performanceLevel: 6}),
        benchmark_data_points: benchmarkDataPoints
      }
    }),
    storyProps({
      student: {
        id: 8,
        first_name: 'Amir',
        grade: '3'
      },
      readerJson: {
        ...defaultProps.readerJson,
        benchmark_data_points: benchmarkDataPoints
      }
    })
  ];
}

const Nows = {
  FALL: '2018-09-19T11:03:06.123Z',
  WINTER: '2019-01-11T11:03:06.123Z',
  SPRING: '2018-05-15T11:03:06.123Z'
};

storiesOf('reader_profile_january/ReaderProfileJanuary', module) // eslint-disable-line no-undef
  .add('all', () => {
    const times = [Nows.FALL, Nows.WINTER, Nows.SPRING];
    const runs = times.map(nowString => {
      return [nowString, studentCases(nowString)];
    });
    return (
      <div style={{display: 'flex', margin: 20}}>
        {runs.map(([nowString, cases]) => {
          return (
            <div key={nowString} style={{marginBottom: 40}}>
              <h4 style={{color: '#999', margin: 5}}>on {toMomentFromTimestamp(nowString).format('M/D/Y')}</h4>
              {cases.map((props, index) => (
                <div key={index} style={{marginRight: 20, marginBottom: 20}}>
                  <h2>{props.student.first_name}, {props.student.grade}</h2>
                  <div style={{width: 1000, border: '1px solid #333'}}>
                    {withNowContext(nowString, (
                      <PerDistrictContainer districtKey="somerville">
                        <ReaderProfileJanuary {...props} />
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
  });