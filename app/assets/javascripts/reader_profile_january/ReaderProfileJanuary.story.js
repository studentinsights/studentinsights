import React from 'react';
import {storiesOf} from '@storybook/react';
import {withNowContext} from '../testing/NowContainer';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {toMomentFromTimestamp} from '../helpers/toMoment';
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
  const dateTaken = toMomentFromTimestamp(beforeNowString).clone().subtract(35, 'days').toDate();
  const performanceLevel = options.performanceLevel || 4;
  return {
    composite: {
      date_taken: dateTaken,
      performance_level: 6
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
      performance_level: 6
    },
    reading: {
      date_taken: dateTaken,
      performance_level: 6
    },
    comprehension: {
      date_taken: dateTaken,
      performance_level: 6
    },
    writing: {
      date_taken: dateTaken,
      performance_level: 6
    },
  };
}

function studentCases(nowString) {
  const defaultProps = storyProps();
  return [
    storyProps({}),
    storyProps({
      student: {
        id: 7,
        first_name: 'Alex',
        grade: '1'
      },
      readerJson: {
        ...defaultProps.readerJson,
        access: testAccess(nowString)
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
        access: testAccess(nowString, {performanceLevel: 6})
      }
    }),
    storyProps({
      student: {
        id: 8,
        first_name: 'Amir',
        grade: '3'
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
        {runs.map(([nowString, cases], index) => {
          return (
            <div key={index} style={{marginBottom: 40}}>
              <h4 style={{color: '#999', margin: 5}}>on {toMomentFromTimestamp(nowString).format('M/D/Y')}</h4>
              {cases.map(props => (
                <div key={nowString} style={{marginRight: 20, marginBottom: 20}}>
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