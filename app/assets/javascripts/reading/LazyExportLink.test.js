import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import LazyExportLink from './LazyExportLink';


export function testProps(props) {
  return {
    exportCsvFn() {
      return {
        csvText: "name,age\nbill,12\nted,13",
        filename: 'adventurers.csv'
      };
    },
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  const props = testProps();
  ReactDOM.render(<LazyExportLink {...props} />, el);
});

it('snapshots', () => {
  const props = testProps();
  const tree = renderer
    .create(<LazyExportLink {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});