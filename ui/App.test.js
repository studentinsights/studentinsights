import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {MemoryRouter} from 'react-router-dom';
import {createSerializedDataEducator} from '../spec/javascripts/fixtures/serializedDataEducator';

it('renders without crashing', () => {
  const currentEducator = createSerializedDataEducator();
  const div = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={["/home"]}>
      <App currentEducator={currentEducator} />
    </MemoryRouter>, div);
});