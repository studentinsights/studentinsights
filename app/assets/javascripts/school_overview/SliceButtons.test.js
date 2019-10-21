import React from 'react';
import ReactDOM from 'react-dom';
import {withDefaultNowContext} from '../testing/NowContainer';
import SliceButtons from './SliceButtons';

function testProps(props = {}) {
  return {
    students: [],
    filters: [],
    filtersHash: '',
    clearFilters: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<SliceButtons {...props} />), el);
  expect(el.innerHTML).toContain('Link to save these filters');
  expect(el.innerHTML).toContain('Download CSV');
});