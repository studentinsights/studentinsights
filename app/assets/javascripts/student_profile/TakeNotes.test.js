import {
  studentProfile,
  nowMoment,
  currentEducator
} from '../../../../spec/javascripts/student_profile/fixtures.jsx';
import TakeNotes from './TakeNotes';

export function testProps(props = {}) {
  return {
    nowMoment: nowMoment,
    eventNoteTypesIndex: studentProfile.eventNoteTypesIndex,
    currentEducator: currentEducator,
    onSave: jest.fn(),
    onCancel: jest.fn(),
    onClickNoteType: jest.fn(),
    onChangeNoteInProgressText: jest.fn(),
    onChangeAttachmentUrl: jest.fn(),
    requestState: null,
    noteInProgressText: '',
    noteInProgressType: null,
    noteInProgressAttachmentUrls: [],
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<TakeNotes {...props} />, el);

  expect(el.innerHTML).toContain('February 11, 2016');
  expect(el.innerHTML).toContain('demo@example.com');
  expect($(el).find('textarea').length).toEqual(1);
  expect($(el).find('.btn.note-type').length).toEqual(6);
  expect($(el).find('.btn.save').length).toEqual(1);
  expect($(el).find('.btn.cancel').length).toEqual(1);
});
