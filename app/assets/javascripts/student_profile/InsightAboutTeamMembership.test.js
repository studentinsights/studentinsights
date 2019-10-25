import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import InsightAboutTeamMembership from './InsightAboutTeamMembership';


function testProps(props = {}) {
  return {
    firstName: 'Mari',
    insightPayload: {
      activity_text: 'Indoor Track - Girls Varsity',
      season_key: 'winter',
      school_year_text: '2018-19',
      coach_text: 'Eric Taylor',
      active: true,
    },
    ...props
  };
}

function testEl(props = {}) {
  return withDefaultNowContext(<InsightAboutTeamMembership {...props} />);
}


// since element sizing methods aren't present in the Jest JS environment
jest.mock('../components/FitText', () => 'mocked-fit-text');

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(testEl(props), el);
});

it('snapshots view', () => {
  const props = testProps();
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('snapshots for last year', () => {
  const defaultProps = testProps();
  const props = {
    ...defaultProps,
    insightPayload: {
      ...defaultProps.insightPayload,
      school_year_text: '2017-18',
      active: false
    }
  };
  const tree = renderer
    .create(testEl(props))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
