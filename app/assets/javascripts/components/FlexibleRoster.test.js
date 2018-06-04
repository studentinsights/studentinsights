import React from 'react';
import ReactDOM from 'react-dom';
import FlexibleRoster from './FlexibleRoster';


function testProps(props = {}) {
  return {
    columns: [
      { label: 'Test Label 1', key: 'element1'},
      { label: 'Test Label 2', key: 'element2'},
      { label: 'Test Label 3', key: 'element3'}
    ],
    rows: [
      { id: 1, element1: 'Data 1-1', element2: 'Data 1-2', element3: 'Data 1-3'},
      { id: 2, element1: 'Data 2-1', element2: 'Data 2-2', element3: 'Data 2-3'},
      { id: 3, element1: 'Data 3-1', element2: 'Data 3-2', element3: 'Data 3-3'}
    ],
    initialSortIndex: 0,
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(<FlexibleRoster {...props} />, el);
  return {el};
}

describe('high-level integration test', () => {
  it('renders the correct headers', () => {
    const {el} = testRender(testProps());
    const headers = $(el).find('#roster-header th');
    expect(headers.length).toEqual(3);
    expect(headers[0].innerHTML).toEqual('Test Label 1');
  });

  it('renders the correct data', () => {
    const {el} = testRender(testProps());

    const dataElements = $(el).find('#roster-data tr');

    expect(dataElements.length).toEqual(3);

    const firstDataRows = dataElements.eq(0).find('td');
    expect(firstDataRows[0].innerHTML).toEqual('Data 1-1');
  });
});