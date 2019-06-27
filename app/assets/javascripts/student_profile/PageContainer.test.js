import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {mount} from 'enzyme';
import ReactTestUtils from 'react-dom/test-utils';
import fetchMock from 'fetch-mock/es5/client';
import {withDefaultNowContext, testTimeMoment} from '../testing/NowContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import mockHistory from '../testing/mockHistory';
import changeTextValue from '../testing/changeTextValue';
import PageContainer from './PageContainer';
import {createSpyActions, createSpyApi} from './PageContainer.mocks';
import {testPropsForPlutoPoppins} from './LightProfilePage.fixture';


function testProps(props = {}) {
  const {feed, profileJson} = testPropsForPlutoPoppins();
  return {
    profileJson,
    defaultFeed: feed,
    queryParams: {},
    history: mockHistory(),
    actions: createSpyActions(),
    api: createSpyApi(),
    noteInProgressText: '',
    noteInProgressType: null,
    ...props
  };
}

function mountWithContext(props) {
  const el = document.createElement('div');
  const wrapper = mount(<PageContainer {...props} />, {
    attachTo: el,
    context: {
      districtKey: SOMERVILLE,
      nowFn: testTimeMoment
    },
    childContextTypes: {
      districtKey: PropTypes.string.isRequired,
      nowFn: PropTypes.func.isRequired
    }
  });

  return {wrapper, el};
}

function patchNotesToBeWrittenByCurrentUser(fixtureProps) {
  const {currentEducator} = fixtureProps.profileJson;
  const {defaultFeed} = fixtureProps;
  return {
    ...fixtureProps,
    defaultFeed: {
      ...fixtureProps.defaultFeed,
      event_notes: defaultFeed.event_notes.map(eventNote => {
        return {
          ...eventNote,
          educator_id: currentEducator.id
        };
      })
    }
  };
}

function renderForEndToEnd() {
  const props = patchNotesToBeWrittenByCurrentUser(testProps({
    api: undefined, // not mocked
    actions: undefined // not mocked
  }));
  const {el} = helpers.renderInto(props);

  // click open full history
  helpers.showFullCaseHistory(el);
  expect($(el).find('.NoteShell').length).toBeGreaterThan(2);

  return {el};
}


const helpers = {
  renderInto(props) {
    const mergedProps = testProps(props);
    const el = document.createElement('div');
    const instance = ReactDOM.render( //eslint-disable-line react/no-render-return-value
      withDefaultNowContext(
        <PerDistrictContainer districtKey={SOMERVILLE}>
          <PageContainer {...mergedProps} />
        </PerDistrictContainer>
      )
      , el);
    return {el, instance};
  },

  takeNotesAndSave(el, uiParams) {
    ReactTestUtils.Simulate.click($(el).find('.btn.take-notes').get(0));
    changeTextValue($(el).find('textarea').get(0), uiParams.text);
    ReactTestUtils.Simulate.click($(el).find('.btn.note-type:contains(' + uiParams.eventNoteTypeText + ')').get(0));
    ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  },

  showFullCaseHistory(el) {
    ReactTestUtils.Simulate.click($(el).find('.CleanSlateMessage-show-history-link').get(0));
  },

  editNoteText(el, noteIndex, uiParams) {
    const $noteCard = $(el).find('.NotesList .NoteShell').eq(noteIndex);
    const $text = $noteCard.find('.ResizingTextArea');
    changeTextValue($text.get(0), uiParams.text);
  },

  recordServiceAndSave(el, uiParams) {
    ReactTestUtils.Simulate.click($(el).find('.btn.record-service').get(0));
    ReactTestUtils.Simulate.click($(el).find('.btn.service-type:contains(' + uiParams.serviceText + ')').get(0));
    changeTextValue($(el).find('.ProvidedByEducatorDropdown'), uiParams.educatorText);
    changeTextValue($(el).find('.datepicker'), uiParams.dateStartedText);
    ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  }
};

describe('integration tests', () => {
  it('renders everything without raising on the happy path', () => {
    const {el} = helpers.renderInto();
    expect($(el).text()).toContain('Pluto Poppins');
  });

  it('opens dialog when clicking Take Notes button', () => {
    const {el} = helpers.renderInto();

    ReactTestUtils.Simulate.click($(el).find('.btn.take-notes').get(0));
    expect($(el).text()).toContain('What are these notes from?');
    expect($(el).text()).toContain('Save notes');
  });

  it('opens dialog when clicking Record Service button', () => {
    const {el} = helpers.renderInto();

    ReactTestUtils.Simulate.click($(el).find('.btn.record-service').get(0));
    expect($(el).text()).toContain('Who is working with Pluto?');
    expect($(el).text()).toContain('Record service');
  });

  it('can save notes for SST meetings, mocking the action handlers', () => {
    const props = testProps();
    const {el} = helpers.renderInto(props);
    helpers.takeNotesAndSave(el, {
      eventNoteTypeText: 'SST Meeting',
      text: 'hello!'
    });

    expect(props.actions.onCreateNewNote).toHaveBeenCalledWith({
      eventNoteTypeId: 300,
      text: 'hello!',
      isRestricted: false,
      eventNoteAttachments: []
    });
  });

  it('can edit own notes for SST meetings, mocking the action handlers', done => {
    const props = patchNotesToBeWrittenByCurrentUser(testProps());
    const {el} = helpers.renderInto(props);

    // click open full history
    helpers.showFullCaseHistory(el);
    expect($(el).find('.NoteShell').length).toBeGreaterThan(2);

    // edit note inline, triggering save
    const noteIndex = 1;
    helpers.editNoteText(el, noteIndex, {
      text: 'world!'
    });

    // wait for debounce
    setTimeout(() => {
      expect(props.actions.onUpdateExistingNote).toHaveBeenCalledWith({
        id: 26,
        eventNoteTypeId: 300,
        text: 'world!'
      });
      done();
    }, 600);
  });

  it('verifies that the educator name is in the correct format', () => {
    const props = testProps();
    const {wrapper, el} = mountWithContext(props);
    const instance = wrapper.instance();

    // Simulate that the server call is still pending
    const unresolvedPromise = new Promise((resolve, reject) => {});
    props.api.saveService.mockReturnValue(unresolvedPromise);
    instance.onSaveService({
      providedByEducatorName: 'badinput'
    });
    expect($(el).text()).toContain('Please use the form Last Name, First Name');

    instance.onSaveService({
      providedByEducatorName: 'Teacher, Test'
    });
    expect($(el).text()).toContain('Saving...');

    // Name can also be blank
    instance.onSaveService({
      providedByEducatorName: ''
    });
    expect($(el).text()).toContain('Saving...');
  });

  // TODO(kr) the spec helper here was reaching into the react-select internals,
  // which changed in 1.0.0, this needs to be updated.
  // it('can save an Attendance Contract service, mocking the action handlers', () => {
  //   const props = testProps();
  //   const {el} = helpers.renderInto(props);
  //   helpers.recordServiceAndSave(el, {
  //     serviceText: 'Attendance Contract',
  //     educatorText: 'Teacher, Test',
  //     dateStartedText: '2/22/16'
  //   });

  //   expect(props.actions.onSaveService).toHaveBeenCalledWith({
  //     serviceTypeId: 503,
  //     providedByEducatorId: 2,
  //     dateStartedText: '2016-02-22',
  //     recordedByEducatorId: 1
  //   });
  // });

  it('#mergedDiscontinueService', () => {
    const props = testProps();
    const {wrapper} = mountWithContext(props);
    const instance = wrapper.instance();
    const updatedState = instance.mergedDiscontinueService(instance.state, 312, 'foo');
    expect(Object.keys(updatedState)).toEqual(Object.keys(instance.state));
    expect(updatedState.requests.discontinueService).toEqual({ 312: 'foo' });
    expect(instance.mergedDiscontinueService(updatedState, 312, null)).toEqual(instance.state);
  });
});


describe('end-to-end through the network', () => {
  describe('when editing a note fails', () => {
    beforeEach(() => {
      fetchMock.restore();
      fetchMock.patch('express:/api/event_notes/:id', 503);
    });

    it('shows an error', done => {
      const {el} = renderForEndToEnd();

      // edit note inline, triggering save
      helpers.editNoteText(el, 1, {text: 'world!'});

      // wait for debounce
      setTimeout(() => {
        // expect network
        const calls = fetchMock.calls();
        expect(calls.length).toEqual(1);
        expect(calls[0][0]).toEqual('/api/event_notes/26');
        expect(JSON.parse(calls[0][1].body)).toEqual({
          "event_note":{"text":"world!"}
        });

        // UI update
        expect($(el).text()).toContain('Your note is not saved');
        done();
      }, 600);
    });
  });

  describe('when editing succeeds', () => {
    beforeEach(() => {
      fetchMock.restore();
      fetchMock.patch('express:/api/event_notes/:id', {
        text: 'world!'
      });
    });

    it('works', done => {
      const {el} = renderForEndToEnd();

      // edit note inline, triggering save
      helpers.editNoteText(el, 1, {text: 'world!'});

      // wait for debounce
      setTimeout(() => {
        // expect network
        const calls = fetchMock.calls();
        expect(calls.length).toEqual(1);
        expect(calls[0][0]).toEqual('/api/event_notes/26');
        expect(JSON.parse(calls[0][1].body)).toEqual({
          "event_note":{"text":"world!"}
        });

        // UI update
        expect($(el).text()).not.toContain('Your note is not saved');
        expect($(el).text()).not.toContain('Saving...');
        done();
      }, 600);
    });
  });

  describe('when creating a new note succeeds', () => {
    beforeEach(() => {
      fetchMock.restore();
      fetchMock.post('express:/api/event_notes', {
        id: 999,
        student_id: 8,
        educator_id: 1,
        event_note_type_id: 300,
        is_restricted: false,
        text: 'hello world!',
        attachments: [],
        recorded_at: testTimeMoment.toString(),
        event_note_revisions_count: 0,
        latest_revision_at: null
      });
    });

    it('works', done => {
      const {el} = renderForEndToEnd();

      helpers.takeNotesAndSave(el, {
        eventNoteTypeText: 'SST Meeting',
        text: 'hello world!'
      });

      // wait for debounce
      setTimeout(() => {
        // expect network
        const calls = fetchMock.calls();
        expect(calls.length).toEqual(1);
        expect(calls[0][0]).toEqual('/api/event_notes');
        expect(JSON.parse(calls[0][1].body)).toEqual({
          "event_note":{
            "student_id": 8,
            "text":"hello world!",
            "is_restricted": false,
            "event_note_type_id": 300,
            "event_note_attachments_attributes": []
          }
        });

        // UI close dialog, no more saving indicator, and note text
        // is in list
        expect($(el).text()).not.toContain('Saving...');
        expect($(el).text()).not.toContain('Save note');
        expect($(el).text()).toContain('hello world!');

        done();
      }, 800);
    });
  });
});