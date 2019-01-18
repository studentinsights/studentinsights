import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import MakePlan from './MakePlan';


export function testProps(props) {
  return {
    plan: {
      primaryEducatorIds: [],
      additionalEducatorIds: [],
      planText: ''
    },
    onPlanChanged: jest.fn(),
    onDone: jest.fn(),
    educators: [
      {"id":2,"full_name":"Teacher, Vivian","homeroom":{"id":1,"name":"HEA 003","grade":"KF"}},
      {"id":3,"full_name":"Teacher, Alonso"},
      {"id":4,"full_name":"Teacher, Silva"}
    ],
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<MakePlan {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<MakePlan {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});