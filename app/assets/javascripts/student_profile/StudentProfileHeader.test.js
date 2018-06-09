import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import moment from 'moment';
import {studentProfile} from './fixtures';
import StudentProfileHeader from './StudentProfileHeader';

const helpers = {
  renderActiveStudent(el, props) {
    const mergedProps = {
      student: studentProfile.student,
      ...props
    };
    ReactDOM.render(<StudentProfileHeader {...mergedProps} />, el);
  },

  renderTransferredStudent(el, props) {
    const this_student = studentProfile.student;
    this_student['enrollment_status'] = 'Transferred';

    const mergedProps = {
      student: this_student,
      ...props
    };
    ReactDOM.render(<StudentProfileHeader {...mergedProps} />, el);
  }

};

describe('active enrolled student', () => {
  it('renders note-taking area with homeroom', () => {
    const el = document.createElement('div');
    helpers.renderActiveStudent(el);
    const yearsOld = moment().diff(studentProfile.student.date_of_birth, 'years'); // TODO (ARS): mock moment.utc() for spec
                                                                                   // so we don't have to calculate this
    expect(el.innerHTML).toContain('Daisy Poppins');
    expect(el.innerHTML).toContain('Arthur D Healey');
    expect(el.innerHTML).toContain('5/23/2008');
    expect(el.innerHTML).toContain('(' + yearsOld + ' years old)');
    expect($(el).find('a.homeroom-link').text()).toContain('102');

    const modalIconEl = $(el).find('.click-event-modal').get(0);

    ReactTestUtils.Simulate.click(modalIconEl, () => {
      const modalText = $(document).find('.contact-info-modal').html();
      expect(modalText).toContain('1 Memorial Dr, Cambridge, MA 02142');
      expect(modalText).toContain('999-999-9999 C-Mom');
      expect(modalText).toContain('parent@example.com');
    });
  });
});

describe('non-active Transferred student', () => {
  it('renders note-taking area with Transferred status', () => {
    const el = document.createElement('div');
    helpers.renderTransferredStudent(el);

    expect(el.innerHTML).toContain('Daisy Poppins');
    expect(el.innerHTML).toContain('Arthur D Healey');
    expect(el.innerHTML).toContain('Transferred');
  });
});
