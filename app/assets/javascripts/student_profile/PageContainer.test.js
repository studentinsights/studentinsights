import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import {nowMoment, studentProfile} from './fixtures/fixtures';
import {mount} from 'enzyme';
import {withDefaultNowContext, testContext} from '../testing/NowContainer';
import mockHistory from '../testing/mockHistory';
import changeReactSelect from '../testing/changeReactSelect';
import changeTextValue from '../testing/changeTextValue';
import PageContainer from './PageContainer';

function testProps(props = {}) {
  return {
    nowMomentFn: () => { return nowMoment; },
    serializedData: studentProfile,
    queryParams: {},
    history: mockHistory(),
    actions: helpers.createSpyActions(),
    api: helpers.createSpyApi(),
    noteInProgressText: '',
    noteInProgressType: null,
    districtKey: 'somerville',
    ...props
  };
}

function mountWithContext(props) {
  return mount(<PageContainer {...props} />, { context: testContext() });
}

const helpers = {
  findColumns(el) {
    return $(el).find('.summary-container > div');
  },

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
    const instance = ReactDOM.render(withDefaultNowContext(<PageContainer {...mergedProps} />), el); //eslint-disable-line react/no-render-return-value
    return {el, instance};
  },

  takeNotesAndSave(el, uiParams) {
    ReactTestUtils.Simulate.click($(el).find('.btn.take-notes').get(0));
    changeTextValue($(el).find('textarea').get(0), uiParams.text);
    ReactTestUtils.Simulate.click($(el).find('.btn.note-type:contains(' + uiParams.eventNoteTypeText + ')').get(0));
    ReactTestUtils.Simulate.click($(el).find('.btn.save').get(0));
  },

  editNoteAndSave(el, uiParams) {
    const $noteCard = $(el).find('.NotesList .NoteCard').first();
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
  it('renders everything on the happy path', () => {
    const {el} = helpers.renderInto();

    expect($(el).text()).toContain('Daisy Poppins');
    expect(helpers.findColumns(el).length).toEqual(5);
    expect($(el).find('.Sparkline').length).toEqual(9);
    expect($(el).find('.InterventionsDetails').length).toEqual(1);

    const interventionLists = helpers.interventionSummaryLists(el);
    expect(interventionLists.length).toEqual(3);
    expect(interventionLists[0].innerHTML).toContain('Reg Ed');
    expect(interventionLists[1].innerHTML).toContain('Counseling, outside');
    expect(interventionLists[1].innerHTML).toContain('Attendance Contract');
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
    expect($(el).text()).toContain('Who is working with Daisy?');
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
      eventNoteAttachments: []
    });
  });

  it('can edit notes for SST meetings, mocking the action handlers', () => {
    const props = testProps();
    const {el} = helpers.renderInto(props);

    helpers.editNoteAndSave(el, {
      eventNoteTypeText: 'SST Meeting',
      text: 'world!'
    });

    expect(props.actions.onClickSaveNotes).toHaveBeenCalledWith({
      id: 3,
      eventNoteTypeId: 300,
      text: 'world!'
    });
  });

  it('verifies that the educator name is in the correct format', () => {
    const props = testProps();
    const {instance, el} = helpers.renderInto(props);

    // Simulate that the server call is still pending
    props.api.saveService.mockReturnValue($.Deferred());
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
    const wrapper = mountWithContext(props);
    const instance = wrapper.instance();
    const updatedState = instance.mergedDiscontinueService(instance.state, 312, 'foo');
    expect(Object.keys(updatedState)).toEqual(Object.keys(instance.state));
    expect(updatedState.requests.discontinueService).toEqual({ 312: 'foo' });
    expect(instance.mergedDiscontinueService(updatedState, 312, null)).toEqual(instance.state);
  });
});
