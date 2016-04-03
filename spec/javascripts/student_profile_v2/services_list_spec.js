//= require ./fixtures

describe('ServicesList', function() {
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SpecSugar = window.shared.SpecSugar;
  var ServicesList = window.shared.ServicesList;
  var fromPair = window.shared.fromPair;
  var Fixtures = window.shared.Fixtures;

  var helpers = {
    fixtureService: function() {
      return {
        id: 267,
        student_id: 3,
        provided_by_educator_id: 2,
        recorded_by_educator_id: 1,
        service_type_id: 507,
        recorded_at: "2016-04-03T01:43:15.256Z",
        date_started: "2016-04-03T00:00:00.000Z",
        created_at: "2016-04-03T01:43:15.257Z",
        updated_at: "2016-04-03T01:43:15.257Z"
      };
    },

    renderInto: function(el, props) {
      var mergedProps = merge({
        services: [],
        educatorsIndex: Fixtures.studentProfile.educatorsIndex,
        serviceTypesIndex: Fixtures.studentProfile.serviceTypesIndex,
        discontinueServiceRequests: {},
        onClickDiscontinueService: jasmine.createSpy('onClickDiscontinueService')
      }, props || {});
      return ReactDOM.render(createEl(ServicesList, mergedProps), el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function() {
    it('renders message when no services', function() {
      var el = this.testEl;
      helpers.renderInto(el);
      expect(el).toContainText('No services');
    });

    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el, { services: [helpers.fixtureService()] });
      expect(el).toContainText('Reading intervention');
      expect(el).toContainText('With');
      expect(el).toContainText('Since April 3, 2016');
      expect(el).toContainText('Discontinue');
    });

    it('asks for confirmation before discontinuing', function() {
      var el = this.testEl;
      helpers.renderInto(el, { services: [helpers.fixtureService()] });
      $(el).find('.btn').click();
      expect(el).toContainText('Confirm');
      expect(el).toContainText('Cancel');
    });

    it('shows a message when request in progress', function() {
      var el = this.testEl;
      var service = helpers.fixtureService();
      helpers.renderInto(el, {
        services: [service],
        discontinueServiceRequests: fromPair(service.id, 'pending')
      });
      expect($(el).find('.btn').text()).toEqual('Updating...');
    });
  });
});