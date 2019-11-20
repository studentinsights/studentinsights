import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import {withDefaultNowContext} from '../testing/NowContainer';
import {McasNextGenChart} from './McasChart';


function testProps(props) {
  return {
    seriesName: 'Math',
    mcasSeries: [],
    studentGrade: '8',
    ...props
  };
}

jest.mock('../components/HighchartsWrapper', () =>
  props => <pre className="Mocked-HighchartsWrapper">{JSON.stringify(props)}</pre> // eslint-disable-line react/display-name
);

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<McasNextGenChart {...testProps()} />), el);
});

it('snapshots view', () => {
  const tree = renderer
    .create(withDefaultNowContext(<McasNextGenChart {...testProps()} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});