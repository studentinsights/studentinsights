import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import {MemoryRouter} from 'react-router-dom';
import {createSerializedDataEducator} from '../spec/javascripts/fixtures/serializedDataEducator';


function renderRoute(path) {
  const currentEducator = createSerializedDataEducator();
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={[path]}>
      <App currentEducator={currentEducator} />
    </MemoryRouter>, el);
}



jest.mock('../app/assets/javascripts/home/HomePage');
jest.mock('../app/assets/javascripts/educator/EducatorPage');
jest.mock('../app/assets/javascripts/school_courses/SchoolCoursesPage');


it('renders HomePage without crashing', () => {
  renderRoute('/home');
});

it('render EducatorPage without crashing', () => {
  renderRoute('/educators/view/12');
});

it('render SchoolCoursesPage without crashing', () => {
  renderRoute('/schools/hea/courses');
});

describe('unknown route', () => {
  // This has to temporarily remove the Jest setup code 
  // that fails the test when console.warn is triggered.
  var consoleWarn = null; // eslint-disable-line no-var
  beforeEach(() => {
    consoleWarn = console.warn; // eslint-disable-line no-console
    console.warn = jest.fn(); // eslint-disable-line no-console
  });

  afterEach(() => {
    console.warn = consoleWarn; // eslint-disable-line no-console
  });
  
  it('calls console.warn', () => {
    renderRoute('/fdsjfkdsjkflsdjfs');
    expect(console.warn).toHaveBeenCalled(); // eslint-disable-line no-console
  });
});
