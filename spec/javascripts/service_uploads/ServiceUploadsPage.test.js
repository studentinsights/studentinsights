import SpecSugar from '../support/spec_sugar.jsx';
import ReactTestUtils from 'react-addons-test-utils';
import ServiceUploadsPage from '../../../app/assets/javascripts/service_uploads/ServiceUploadsPage.js';

describe('ServiceUploadsPage', () => {
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto: function(el, props) {
      return ReactDOM.render(<ServiceUploadsPage {...props} />, el); //eslint-disable-line react/no-render-return-value
    }
  };

  SpecSugar.withTestEl('integration tests', (container) => {
    it('renders the page', function() {
      const el = container.testEl;
      const props = {
        serializedData: {
          serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
        }
      };

      // Mock fetch('/service_uploads/past'):
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve({
            ok: true,
            json: function() {
              return [];
            }
          });
        });
      });

      helpers.renderInto(el, props);

      expect($(el).text()).toContain('Upload new services');
      expect($(el).text()).toContain('Confirm Upload');
    });

    it('tolerates cancelling file upload', () => {
      const el = container.testEl;
      const instance = helpers.renderInto(el, {
        serializedData: {
          serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
        }
      });

      // Mock fetch('/service_uploads/past'):
      global.fetch = jest.fn().mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve({
            ok: true,
            json: function() {
              return [];
            }
          });
        });
      });

      const fileInputEl = $(el).find('input[type=file]').get(0);
      ReactTestUtils.Simulate.change(fileInputEl);
      expect(instance.state.formData.file_name).toEqual(undefined);
    });

  });
});


