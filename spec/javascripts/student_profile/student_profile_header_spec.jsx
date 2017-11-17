import {studentProfile} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';
import ReactTestUtils from 'react-addons-test-utils';
import {merge} from '../../../app/assets/javascripts/helpers/react_helpers.jsx';

describe('StudentProfileHeader', function() {
  const ReactDOM = window.ReactDOM;
  const StudentProfileHeader = window.shared.StudentProfileHeader;

  const helpers = {
    renderActiveStudent: function(el, props) {
      const mergedProps = merge(props || {}, { student: studentProfile.student });
      ReactDOM.render(<StudentProfileHeader {...mergedProps} />, el);
    },

    renderTransferredStudent: function(el, props) {
      const this_student = studentProfile.student;
      this_student['enrollment_status'] = 'Transferred';

      const mergedProps = merge(props || {}, { student: this_student });
      ReactDOM.render(<StudentProfileHeader {...mergedProps} />, el);
    }

  };

  SpecSugar.withTestEl('active enrolled student', function(container) {
    it('renders note-taking area with homeroom', function() {
      const el = container.testEl;
      helpers.renderActiveStudent(el);
      const yearsOld = moment().diff(studentProfile.student.date_of_birth, 'years'); // TODO (ARS): mock moment.utc() for spec
                                                                                     // so we don't have to calculate this
      expect(el.innerHTML).toContain('Daisy Poppins');
      expect(el.innerHTML).toContain('Arthur D Healey');
      expect(el.innerHTML).toContain('5/23/2008');
      expect(el.innerHTML).toContain('(' + yearsOld + ' years old)');
      expect($(el).find('a.homeroom-link').text()).toContain('102');

      const modalIconEl = $(el).find('.click-event-modal').get(0);

      ReactTestUtils.Simulate.click(modalIconEl, function () {
        const modalText = $(document).find('.contact-info-modal').html();
        expect(modalText).toContain('1 Memorial Dr, Cambridge, MA 02142');
        expect(modalText).toContain('999-999-9999 C-Mom');
        expect(modalText).toContain('parent@example.com');
      });
    });
  });

  SpecSugar.withTestEl('non-active Transferred student', function(container) {
    it('renders note-taking area with Transferred status', function() {
      const el = container.testEl;
      helpers.renderTransferredStudent(el);

      expect(el.innerHTML).toContain('Daisy Poppins');
      expect(el.innerHTML).toContain('Arthur D Healey');
      expect(el.innerHTML).toContain('Transferred');
    });
  });

});
