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

const Nows = {
  FALL: '2018-09-19T11:03:06.123Z',
  WINTER: '2019-01-11T11:03:06.123Z',
  SPRING: '2018-05-15T11:03:06.123Z'
};

storiesOf('reader_profile_january/ReaderProfileJanuary', module) // eslint-disable-line no-undef
  .add('all', () => {
    const studentProps = [
      storyProps({}),
      storyProps({
        student: {
          id: 7,
          first_name: 'Alex',
          grade: '1'
        }
      }),
      storyProps({
        student: {
          id: 9,
          first_name: 'Ryan',
          grade: '2'
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
    const times = [Nows.FALL, Nows.WINTER, Nows.SPRING];
    const runs = studentProps.map(props => {
      return {times, props};
    });
    return (
      <div style={{display: 'flex', margin: 20}}>
        {runs.map(({props, times}, index) => {
          return (
            <div key={index} style={{marginBottom: 40}}>
              <h2>{props.student.first_name}, {props.student.grade}</h2>
              {times.map(nowString => (
                <div key={nowString} style={{marginRight: 20, marginBottom: 20}}>
                  <h4 style={{color: '#999', margin: 5}}>on {toMomentFromTimestamp(nowString).format('M/D/Y')}</h4>
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