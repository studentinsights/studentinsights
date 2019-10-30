import React from 'react';
import ReactDOM from 'react-dom';
import Delay from './Delay';


it('renders without crashing', async () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <Delay onEnd={jest.fn()}>
      hello
    </Delay>
    , div);
});