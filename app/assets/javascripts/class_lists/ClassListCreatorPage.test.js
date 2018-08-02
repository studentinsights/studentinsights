import React from 'react';
import ReactDOM from 'react-dom';
import {MemoryRouter} from 'react-router-dom';
import {shallow, mount} from 'enzyme';
import _ from 'lodash';
import fetchMock from 'fetch-mock/es5/client';
import {testTimeMoment, testContext, withDefaultNowContext} from '../testing/NowContainer';
import mockWithFixtures from './fixtures/mockWithFixtures';
import ClassListCreatorPage from './ClassListCreatorPage';
import class_list_json from './fixtures/class_list_json';
import {uri, sarah, laura} from '../testing/fixtures/currentEducator';


beforeEach(() => mockWithFixtures());

export function testProps(props) {
  return {
    currentEducator: sarah,
    disableHistory: true,
    disableSizing: true,
    ...props
  };
}

function mountWithContext(props) {
  return mount(<ClassListCreatorPage {...props} />, { context: testContext() });
}

function anyServerCallsIncludePath(string) {
  return _.any(fetchMock.calls(), call => {
    const path = call[0];
    return path.indexOf(string) !== -1;
  });
}

function modifiedPrincipalStudentIdsByRoom() {
  const {studentIdsByRoom} = class_list_json.class_list.json;
  return {
    "room:unplaced": studentIdsByRoom['room:unplaced'].concat(studentIdsByRoom['room:0']),
    "room:0":[],
    "room:1":studentIdsByRoom['room:1']
  };
}

it('renders without crashing on entrypoint', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists']}>
      {withDefaultNowContext(<ClassListCreatorPage {...props} />)}
    </MemoryRouter>
  , el);
});

it('renders without crashing with balanceId', () => {
  const props = testProps({defaultWorkspaceId: 'foo-id'});
  const el = document.createElement('div');
  ReactDOM.render(
    <MemoryRouter initialEntries={['/classlists/foo-id']}>
      {withDefaultNowContext(<ClassListCreatorPage {...props} />)}
    </MemoryRouter>
  , el);
});

it('integration test for state changes, server requests and autosave', done => {
  const props = testProps({ autoSaveIntervalMs: 200 });
  const wrapper = mountWithContext(props);
  wrapper.instance().onSchoolIdChanged(4);
  wrapper.instance().onGradeLevelNextYearChanged('6');
  wrapper.instance().onStepChanged(2);
  wrapper.instance().onClassroomsCountIncremented(2);

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
      expect(anyServerCallsIncludePath('teacher_updated_class_list_json')).toEqual(true);
      expect(anyServerCallsIncludePath('principal_revised_class_list_json')).toEqual(false);
      done();
    }, 300); // delay for autosave interval
  }, 10); // delay a tick for fetch requests
});

it('integration test for loading existing workspace', done => {
  const props = testProps({
    defaultWorkspaceId: 'foo-workspace-id',
    autoSaveIntervalMs: 200
  });
  const wrapper = mountWithContext(props);

  // Waiting for data to load
  setTimeout(() => {
    expect(wrapper.state().lastSavedSnapshot).not.toEqual(null);
    expect(wrapper.instance().isDirty()).toEqual(false);
    expect(wrapper.state().schoolId).toEqual(2);
    expect(wrapper.state().gradeLevelNextYear).toEqual('3');
    expect(wrapper.state().stepIndex).toEqual(0);
    expect(wrapper.state().students.length).toEqual(57);
    expect(Object.keys(wrapper.state().studentIdsByRoom)).toEqual([
      'room:unplaced',
      'room:0',
      'room:1'
    ]);
    expect(wrapper.state().feedbackText).toEqual('feedback!');
    expect(wrapper.state().principalNoteText).toEqual('principal!');
    expect(wrapper.state().planText).toEqual('plan!');

    // Type other feedback values
    wrapper.instance().onFeedbackTextChanged('other feedback');
    expect(wrapper.state().feedbackText).toEqual('other feedback');

    done();
  }, 10); // delay a tick for fetch requests
});


it('integration test for first-time principal revision', done => {
  // Update mock so that it's as if this class list were already submitted
  fetchMock.get('express:/api/class_lists/:workspace_id/class_list_json', {
    ...class_list_json,
    is_editable: false,
    class_list: {
      ...class_list_json.class_list,
      submitted: true
    }
  }, { overwriteRoutes: true });

  // This is the modifications we'll make as principal
  const principalStudentIdsByRoom = modifiedPrincipalStudentIdsByRoom();

  // Start the test
  const props = testProps({
    currentEducator: laura,
    defaultWorkspaceId: 'foo-workspace-id',
    autoSaveIntervalMs: 200
  });
  const wrapper = mountWithContext(props);

  // Waiting for data to load
  setTimeout(() => {
    expect(wrapper.state().lastSavedSnapshot).not.toEqual(null);
    expect(wrapper.instance().isDirty()).toEqual(false);

    // Make changes to the list as a principal and verify they update state correctly
    wrapper.instance().onStepChanged(4);
    wrapper.instance().onClassListsChangedByPrincipal(principalStudentIdsByRoom);
    expect(wrapper.state().principalStudentIdsByRoom).toEqual(principalStudentIdsByRoom);

    // Add teacher names
    wrapper.instance().onStepChanged(5);
    wrapper.instance().onPrincipalTeacherNamesByRoomChanged({
      "room:0":"Uri",
      "room:1":"Ale..."
    });
    expect(wrapper.state().principalTeacherNamesByRoom).toEqual({
      "room:0":"Uri",
      "room:1":"Ale..."
    });

    // Verify that changes get autosaved
    expect(wrapper.instance().isDirty()).toEqual(true);
    setTimeout(() => {
      expect(wrapper.instance().isDirty()).toEqual(false);
      expect(wrapper.state().lastSavedSnapshot.principalTeacherNamesByRoom).toEqual({
        "room:0":"Uri",
        "room:1":"Ale..."
      });
      expect(wrapper.state().lastSavedSnapshot.principalStudentIdsByRoom).toEqual(principalStudentIdsByRoom);
      expect(anyServerCallsIncludePath('teacher_updated_class_list_json')).toEqual(false);
      expect(anyServerCallsIncludePath('principal_revised_class_list_json')).toEqual(true);
      done();
    }, 300); // delay for autosave interval
  }, 10); // delay a tick for fetch requests
});


it('#onFetchedClassList loads principal revisions', () => {
  const props = testProps();
  const principalStudentIdsByRoom = modifiedPrincipalStudentIdsByRoom();
  const wrapper = mountWithContext(props);
  wrapper.instance().onFetchedClassList({
    ...class_list_json,
    class_list: {
      ...class_list_json.class_list,
      revised_by_principal_educator_id: laura.id,
      principal_revisions_json: {
        principalStudentIdsByRoom,
        "principalTeacherNamesByRoom":{
          "room:0":"Kevin",
          "room:1":"Alex",
        },
        "clientNowMs":testTimeMoment().unix()
      }
    }
  });
  expect(wrapper.state().principalStudentIdsByRoom).toEqual(principalStudentIdsByRoom);
  expect(wrapper.state().principalTeacherNamesByRoom).toEqual({
    "room:0":"Kevin",
    "room:1":"Alex"
  });
});

it('#isRevisable', () => {
  function isRevisableForEducator(currentEducator, state = {}) {
    const props = testProps({currentEducator});
    const wrapper = shallow(<ClassListCreatorPage {...props} />, {context: testContext()});
    wrapper.instance().setState(state);
    return wrapper.instance().isRevisable();
  }

  expect(isRevisableForEducator(laura, {schoolId: 2, isSubmitted: true })).toEqual(true);
  expect(isRevisableForEducator(laura, {schoolId: 4, isSubmitted: true })).toEqual(false);
  expect(isRevisableForEducator(laura, {schoolId: 2, isSubmitted: false })).toEqual(false);
  expect(isRevisableForEducator(sarah, {schoolId: 2, isSubmitted: true })).toEqual(false);
  expect(isRevisableForEducator(uri, {schoolId: 2, isSubmitted: true })).toEqual(false);
});
