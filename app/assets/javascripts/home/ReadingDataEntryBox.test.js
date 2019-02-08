import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import ReadingDataEntryBox from './ReadingDataEntryBox';


function renderIntoEl(element) {
  const el = document.createElement('div');
  ReactDOM.render(element, el);
  return el;
}

function testProps(props) {
  return {
    educatorLabels: [],
    style: {
      color: 'red'
    },
    titleStyle: {
      color: 'purple'
    },
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  renderIntoEl(<ReadingDataEntryBox {...props} />);
});

it('renders nothing if label not set', () => {
  const props = testProps();
  const el = renderIntoEl(<ReadingDataEntryBox {...props} />);
  expect($(el).text()).toEqual('');
});

it('snapshots if label is set', () => {
  const props = testProps({
    educatorLabels: ['enable_reading_benchmark_data_entry']
  });
  const tree = renderer
    .create(<ReadingDataEntryBox {...props} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
