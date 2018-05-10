import React from 'react';
import ReactDOM from 'react-dom';
import Timestamp from './Timestamp';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<Timestamp railsTimestamp="2018-02-09T12:03:26.664Z" />), el);
  expect($(el).text()).toContain('a month ago on 2/9');
});
