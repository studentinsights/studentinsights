import React from 'react';
import {
  studentProfile,
  nowMoment,
  currentEducator
} from './fixtures';
import SpecSugar from '../../../../spec/javascripts/support/spec_sugar.jsx';
import TakeNotes from './take_notes.jsx';

const helpers = {
  renderInto: function(el, props) {
    const mergedProps = {
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
    window.ReactDOM.render(<TakeNotes {...mergedProps} />, el);
  }
};

SpecSugar.withTestEl('high-level integration tests', function(container) {
  it('renders note-taking area', function() {
    const el = container.testEl;
    helpers.renderInto(el);

    expect(el.innerHTML).toContain('February 11, 2016');
    expect(el.innerHTML).toContain('demo@example.com');
    expect($(el).find('textarea').length).toEqual(1);
    expect($(el).find('.btn.note-type').length).toEqual(6);
    expect($(el).find('.btn.save').length).toEqual(1);
    expect($(el).find('.btn.cancel').length).toEqual(1);
  });
});
