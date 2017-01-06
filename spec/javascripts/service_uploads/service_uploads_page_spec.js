describe('ServiceUploadsPage', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var ServiceUploadsPage = window.shared.ServiceUploadsPage;

  var helpers = {
    renderInto: function(el, props) {
      return ReactDOM.render(createEl(ServiceUploadsPage, props), el);
    },
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('renders the page with no service uploads', function() {
      var el = this.testEl;
      var props = {
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
      var el = this.testEl;
      var props = {
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

      console.log($(el).text());
      // expect(el).toContainText('Upload new services');
      // expect(el).toContainText('Confirm Upload');
    });

  });

});


