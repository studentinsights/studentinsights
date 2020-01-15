import React from 'react';
import {storiesOf} from '@storybook/react';
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
    instructionalStrategiesJson: [],
    ...props
  };
}

storiesOf('reader_profile_january/ReaderProfileJanuary', module) // eslint-disable-line no-undef
  .add('all', () => {
    const props = storyProps();
    const runs = [
      storyProps(),
      storyProps({
        student: {
          id: 2,
          first_name: 'Alex',
          grade: '1'
        }
      }),
      storyProps({
        student: {
          id: 3,
          first_name: 'Amir',
          grade: '3'
        }
      })
    ];
    return (
      <div>
        {runs.map((props, index) => (
          <div key={index} style={{margin: 20, border: '1px solid #333'}}>
            <h3>{props.student.first_name}, {props.student.grade}</h3>
            <ReaderProfileJanuary {...props} />
          </div>
        ))}
      </div>
    );
  });