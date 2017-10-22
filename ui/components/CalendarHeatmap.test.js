import React from 'react';
import ReactDOM from 'react-dom';
import CalendarHeatmap from './CalendarHeatmap';

function testProps(props) {
  return {
    data: {
      '2017-12-18': 2,
      '2017-12-19': 5,
      '2017-12-20': 1
    },
    years: [2017, 2018],
    ...props
  };
}

it('renders boxes, with some colored in', () => {
  const div = document.createElement('div');
  ReactDOM.render(<CalendarHeatmap {...testProps()} />, div);
  expect(div.querySelectorAll('rect').length).toEqual(365);
  expect(div.querySelectorAll('rect[fill]').length).toEqual(3);
  expect(div.querySelectorAll('title').length).toEqual(3);
});

it('can render multiple years', () => {
  const div = document.createElement('div');
  const props = {...testProps(), years: [2017, 2019]};
  ReactDOM.render(<CalendarHeatmap {...props} />, div);
  expect(div.innerHTML).toContain('2017');
  expect(div.innerHTML).toContain('2018');
  expect(div.querySelectorAll('rect').length).toEqual(365 * 2);
});
