import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import GradeTimeGrid from './GradeTimeGrid';

function testProps(props) {
  return {
    grades: ['KF', '1', '2', '3', '4', '5'],
    intervals: [
      [2018, 'fall'],
      [2018, 'winter'],
      [2019, 'spring'],
      [2019, 'fall']
    ],
    renderCellFn(...params) { return <pre>{JSON.stringify(params)}</pre>; },
    renderGradeFn(...params) { return<pre>{JSON.stringify(params)}</pre>; },
    selection: null,
    onSelectionChanged: jest.fn(),
    isFlipped: false,
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<GradeTimeGrid {...testProps()} />, el);
});

describe('snapshots', () => {
  it('default', () => {
    const tree = renderer
      .create(<GradeTimeGrid {...testProps()} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('isFlipped: true', () => {
    const tree = renderer
      .create(<GradeTimeGrid {...testProps()} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
