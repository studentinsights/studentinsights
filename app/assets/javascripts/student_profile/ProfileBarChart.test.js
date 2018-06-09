import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import ProfileBarChart from './ProfileBarChart';

const helpers = {
  renderInto: function(el, props) {
    const mergedProps = {
      events: [],
      id: 'foo-id',
      titleText: 'foo-title',
      monthsBack: 48,
      nowMomentUTC: moment.utc('2017-02-02T13:23:15+00:00'),
      ...props
    };
    ReactDOM.render(<ProfileBarChart {...mergedProps} />, el);
  }
};

it('is wrapped in a div with the given id', function() {
  const el = document.createElement('div');
  helpers.renderInto(el, {id: 'foo'});

  const div = $(el).children().first();
  expect(div.attr('id')).toEqual("foo");
});
