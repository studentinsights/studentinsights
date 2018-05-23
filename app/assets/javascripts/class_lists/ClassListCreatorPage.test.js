import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import {mount} from 'enzyme';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListCreatorPage from './ClassListCreatorPage';

beforeEach(() => mockWithFixtures());

function testProps(props) {
  return {
    disableHistory: true,
    disableSizing: true,
    ...props
  };
}

it('renders without crashing on entrypoint', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists']}>
      <ClassListCreatorPage {...props} />
    </MemoryRouter>
  , el);
});

it('renders without crashing with balanceId', () => {
  const props = testProps({defaultWorkspaceId: 'foo-id'});
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists/foo-id']}>
      <ClassListCreatorPage {...props} />
    </MemoryRouter>
  , el);
});

it('integration test for state changes, server requests and autosave', done => {
  const props = testProps({ autoSaveIntervalMs: 200 }); // just for making tests run faster
  const wrapper = mount(<ClassListCreatorPage {...props} />);
  wrapper.instance().onSchoolIdChanged(4);
  wrapper.instance().onGradeLevelNextYearChanged('6');
  wrapper.instance().onStepChanged(2);

  // This should update component state, but also trigger server
  // requests and other state changes too.
  setTimeout(() => {    
    expect(wrapper.state().schoolId).toEqual(4);
    expect(wrapper.state().gradeLevelNextYear).toEqual('6');
    expect(wrapper.state().stepIndex).toEqual(2);
    expect(wrapper.state().students.length).toEqual(57);
    expect(Object.keys(wrapper.state().studentIdsByRoom)).toEqual([
      'room:unplaced',
      'room:0',
      'room:1',
      'room:2',
      'room:3'
    ]);

    // Make a few more changes and verify workspace is dirty.
    wrapper.instance().onStepChanged(3);
    wrapper.instance().onFeedbackTextChanged('my feedback');
    expect(wrapper.instance().isDirty()).toEqual(true);

    // Wait for autosave to happen and then verify saving.
    setTimeout(() => {
      expect(wrapper.instance().isDirty()).toEqual(false);
      expect(wrapper.state().feedbackText).toEqual('my feedback');
      expect(wrapper.state().lastSavedSnapshot.feedbackText).toEqual('my feedback');
      done();
    }, 300); // delay for autosave interval
  }, 10); // delay a tick for fetch requests
});