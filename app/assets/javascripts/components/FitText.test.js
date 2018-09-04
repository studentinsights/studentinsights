import React from 'react';
import ReactDOM from 'react-dom';
import FitText from './FitText';

function testProps(props) {
  return {
    text: "when there is too much work and I don't know what to do",
    ...props
  };
}

it('renders without crashing', () => {
  const el = document.createElement('div');
  ReactDOM.render(<FitText {...testProps()} />, el);
});

// snapshot or other tests don't work since element sizing methods aren't present in the Jest JS environment