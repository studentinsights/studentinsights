import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Team, {parseTeam} from './Team';

const teams = [
  { coach_text: 'Fatima Teacher', activity_text: 'Competitive Cheerleading Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Cross Country - Boys Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Cross Country - Girls Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Football Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Golf Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Soccer - Boys Freshman' },
  { coach_text: 'Fatima Teacher', activity_text: 'Soccer - Boys JV' },
  { coach_text: 'Fatima Teacher', activity_text: 'Soccer - Boys Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Soccer - Girls JV' },
  { coach_text: 'Fatima Teacher', activity_text: 'Soccer - Girls Varsity' },
  { coach_text: 'Fatima Teacher', activity_text: 'Volleyball - Girls Freshman' },
  { coach_text: 'Fatima Teacher', activity_text: 'Volleyball - Girls JV' },
  { coach_text: 'Fatima Teacher', activity_text: 'Volleyball - Girls Varsity' }
];

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<div>{teams.map(team => <Team key={team.activity_text} team={team} />)}</div>, el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(<div>{teams.map(team => <Team key={team.activity_text} team={team} />)}</div>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

describe('#parseTeam', () => {
  expect(parseTeam('Cross Country - Boys Varsity')).toEqual('Varsity Cross Country');
});
