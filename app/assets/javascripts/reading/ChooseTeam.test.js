import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ChooseTeam from './ChooseTeam';
import teamsJson from './teamsJson.fixture';


export function testProps(props) {
  return {
    onTeamChanged: jest.fn(),
    onDone: jest.fn(),
    team: {
      schoolId: 2,
      grade: '3',
      benchmarkSchoolYear: 2018,
      benchmarkPeriodKey: 'winter'
    },
    teams: {
      schools: teamsJson.schools,
      grades: teamsJson.grades,
      educators: teamsJson.educators,
      benchmarkWindows: teamsJson.benchmark_windows
    },
    ...props
  };
}


it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<ChooseTeam {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<ChooseTeam {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});