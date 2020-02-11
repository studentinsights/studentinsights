import React from 'react';
import ReactDOM from 'react-dom';
import fetchMock from 'fetch-mock/es5/client';
import changeTextValue from '../testing/changeTextValue';
import ProvidedByEducatorDropdown from './ProvidedByEducatorDropdown';

function testProps(props = {}) {
  return {
    onUserTyping: jest.fn(),
    onUserDropdownSelect: jest.fn(),
    ...props
  };
}

function testRender(props = {}) {
  const el = document.createElement('div');
  ReactDOM.render(<ProvidedByEducatorDropdown {...props} />, el);
  return el;
}

beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/possible_names_for_service_json', {
    names: ['Martinez, Pedro', 'Garciaparra, Nomar']
  });
});

it('renders without crashing', () => {
  testRender(testProps());
});

it('typing callback gets proper value', () => {
  const props = testProps();
  const el = testRender(props);
  changeTextValue($(el).find('input').get(0), 'sar');
  expect(props.onUserTyping).toHaveBeenCalledWith('sar');
});
