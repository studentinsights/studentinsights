import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {mount} from 'enzyme';
import ReactTestUtils from 'react-addons-test-utils';
import {withDefaultNowContext, testTimeMoment} from '../testing/NowContainer';
import {SOMERVILLE} from '../helpers/PerDistrict';
import PerDistrictContainer from '../components/PerDistrictContainer';
import mockHistory from '../testing/mockHistory';
import changeReactSelect from '../testing/changeReactSelect';
import changeTextValue from '../testing/changeTextValue';
import PageContainer from './PageContainer';
import {testPropsForPlutoPoppins} from './LightProfilePage.fixture';

function testProps(props = {}) {
  const {feed, profileJson} = testPropsForPlutoPoppins();
  return {
    profileJson,
    defaultFeed: feed,
    queryParams: {},
    history: mockHistory(),
    actions: helpers.createSpyActions(),
    api: helpers.createSpyApi(),
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

const helpers = {
  interventionSummaryLists(el) {
    return $(el).find('.interventions-column .SummaryList').toArray();
  },

  createSpyActions: () => {
    return {
      // Just mock the functions that make server calls
      onColumnClicked: jest.fn(),
      onClickSaveNotes: jest.fn(),
      onClickSaveService: jest.fn(),
      onClickDiscontinueService: jest.fn(),
      onDeleteEventNoteAttachment: jest.fn()
    };
  },

  createSpyApi: () => {
    return {
      saveNotes: jest.fn(),
      deleteEventNoteAttachment: jest.fn(),
      saveService: jest.fn(),
      discontinueService: jest.fn()
    };
  },

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

  editNoteAndSave(el, noteIndex, uiParams) {
    const $noteCard = $(el).find('.NotesList .NoteCard').eq(noteIndex);
    const $text = $noteCard.find('.EditableTextComponent');
    $text.html(uiParams.text);
    ReactTestUtils.Simulate.input($text.get(0));
    ReactTestUtils.Simulate.blur($text.get(0));
  },

  recordServiceAndSave(el, uiParams) {
    ReactTestUtils.Simulate.click($(el).find('.btn.record-service').get(0));
    ReactTestUtils.Simulate.click($(el).find('.btn.service-type:contains(' + uiParams.serviceText + ')').get(0));
    changeReactSelect($(el).find('.Select'), uiParams.educatorText);
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

    expect(props.actions.onClickSaveNotes).toHaveBeenCalledWith({
      eventNoteTypeId: 300,
      text: 'hello!',
      isRestricted: false,
      eventNoteAttachments: []
    });
  });

  it.only('can edit own notes for SST meetings, mocking the action handlers', () => {
    const props = patchNotesToBeWrittenByCurrentUser(testProps());
    const {el} = helpers.renderInto(props);

    // click open full history
    helpers.showFullCaseHistory(el);
    expect($(el).find('.NoteCard').length).toBeGreaterThan(2);

    // edit note and blur to save
    const noteIndex = 1;
    helpers.editNoteAndSave(el, noteIndex, {
      text: 'world!'
    });

    expect(props.actions.onClickSaveNotes).toHaveBeenCalledWith({
      id: 26,
      eventNoteTypeId: 300,
      text: 'world!'
    });
  });

  it('verifies that the educator name is in the correct format', () => {
    const props = testProps();
    const {wrapper, el} = mountWithContext(props);
    const instance = wrapper.instance();

    // Simulate that the server call is still pending
    const unresolvedPromise = new Promise((resolve, reject) => {});
    props.api.saveService.mockReturnValue(unresolvedPromise);
    instance.onClickSaveService({
      providedByEducatorName: 'badinput'
    });
    expect($(el).text()).toContain('Please use the form Last Name, First Name');

    instance.onClickSaveService({
      providedByEducatorName: 'Teacher, Test'
    });
    expect($(el).text()).toContain('Saving...');

    // Name can also be blank
    instance.onClickSaveService({
      providedByEducatorName: ''
    });
    expect($(el).text()).toContain('Saving...');
  });

  // TODO(kr) the spec helper here was reaching into the react-select internals,
  // which changed in 1.0.0, this needs to be updated.
  // it('can save an Attendance Contract service, mocking the action handlers', () => {
  //   var el = container.testEl;
  //   var component = helpers.renderInto();
  //   helpers.recordServiceAndSave(el, {
  //     serviceText: 'Attendance Contract',
  //     educatorText: 'fake-fifth-grade',
  //     dateStartedText: '2/22/16'
  //   });

  //   expect(props.actions.onClickSaveService).toHaveBeenCalledWith({
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
