import React from 'react';
import ReactDOM from 'react-dom';
import ResizingTextArea from './ResizingTextArea';

function testProps(props) {
  return {
    value: "hello",
    onChange: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<ResizingTextArea {...testProps()} />, el);
  expect(el.textContent).toContain('hello');
});


// more meaningful tests would be challenging because there's no layout
// engine in jsdom