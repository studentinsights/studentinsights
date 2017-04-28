import SpecSugar from '../support/spec_sugar.jsx';

describe('ServiceUploadsPage', function() {
  const ReactDOM = window.ReactDOM;
  const ServiceUploadsPage = window.shared.ServiceUploadsPage;

  const helpers = {
    renderInto: function(el, props) {
      ReactDOM.render(<ServiceUploadsPage {...props} />, el);
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('renders the page with no service uploads', function() {
      const el = this.testEl;
      const props = {
        serializedData: {
          serviceUploads: [],
          serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
        }
      };

      helpers.renderInto(el, props);

      expect(el).toContainText('Upload new services');
      expect(el).toContainText('Confirm Upload');
    });

    it('renders the page with existing service upload', function() {
      const el = this.testEl;
      const props = {
        serializedData: {
          serviceUploads: [
            {
              created_at: '2017-01-19 18:21:22',
              file_name: 'bulk_upload.csv',
              id: 1,
              services: [
                {
                  student: {first_name: 'Steve', last_name: 'V.'},
                  service_type: { name: 'Extra Tutoring'}
                }
              ],
            }
          ],
          serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
        }
      };

      helpers.renderInto(el, props);

      expect(el).toContainText('bulk_upload.csv'); // Renders the file name
      expect(el).toContainText('Extra Tutoring');  // Renders the service type name
    });

    it('tolerates cancelling file upload', function() {
      const el = this.testEl;
      const instance = helpers.renderInto(el, {
        serializedData: {
          serviceUploads: [],
          serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
        }
      });

      const fileInputEl = $(el).find('input[type=file]').get(0);
      React.addons.TestUtils.Simulate.change(fileInputEl);
      expect(instance.state.formData.file_name).toEqual(undefined);
    });

  });

});


