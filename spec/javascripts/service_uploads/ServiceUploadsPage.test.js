import SpecSugar from '../support/spec_sugar.jsx';
import ReactTestUtils from 'react-addons-test-utils';
import ServiceUploadsPage from '../../../app/assets/javascripts/service_uploads/ServiceUploadsPage';
import ReactDOM from 'react-dom';

const helpers = {
  renderInto: function(el, props) {
    return ReactDOM.render(<ServiceUploadsPage {...props} />, el); //eslint-disable-line react/no-render-return-value
  }
};

SpecSugar.withTestEl('integration tests', (container) => {
  it('renders the page with no service uploads', () => {
    const el = container.testEl;
    const props = {
      serializedData: {
        serviceUploads: [],
        serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
      }
    };

    helpers.renderInto(el, props);

    expect($(el).text()).toContain('Upload new services');
    expect($(el).text()).toContain('Confirm Upload');
  });

  it('renders the page with existing service upload', () => {
    const el = container.testEl;
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

    expect($(el).text()).toContain('bulk_upload.csv'); // Renders the file name
    expect($(el).text()).toContain('Extra Tutoring');  // Renders the service type name
  });

  it('tolerates cancelling file upload', () => {
    const el = container.testEl;
    const instance = helpers.renderInto(el, {
      serializedData: {
        serviceUploads: [],
        serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
      }
    });

    const fileInputEl = $(el).find('input[type=file]').get(0);
    ReactTestUtils.Simulate.change(fileInputEl);
    expect(instance.state.formData.file_name).toEqual(undefined);
  });

});


