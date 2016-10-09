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
    emptyServicesFeed: function() {
      return { active: [], discontinued: [] };
    },

    oneActiveServiceFeed: function() {
      return {
        active: [helpers.fixtureService()],
        discontinued: []
      };
    },

    fixtureService: function() {
      return {
        id: 267,
        student_id: 3,
        provided_by_educator_id: 2,
        recorded_by_educator_id: 1,
        service_type_id: 507,
        recorded_at: "2016-04-03T01:43:15.256Z",
        date_started: "2016-04-03T00:00:00.000Z",
        discontinued_by_educator_id: null,
        discontinued_recorded_at: null
      };
    },

    renderInto: function(el, props) {
      var mergedProps = merge({
        servicesFeed: {
          active: [],
          discontinued: []
        },
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
      helpers.renderInto(el, { servicesFeed: helpers.emptyServicesFeed() });
      expect(el).toContainText('No services');
    });

    it('renders everything on the happy path', function() {
      var el = this.testEl;
      helpers.renderInto(el, { servicesFeed: helpers.oneActiveServiceFeed() });
      expect(el).toContainText('Reading intervention');
      expect(el).toContainText('With');
      expect(el).toContainText('Started April 3, 2016');
      expect(el).toContainText('Discontinue');
    });

    it('asks for confirmation before discontinuing', function() {
      var el = this.testEl;
      helpers.renderInto(el, { servicesFeed: helpers.oneActiveServiceFeed() });
      $(el).find('.btn').click();
      expect(el).toContainText('Confirm');
      expect(el).toContainText('Cancel');
    });

    it('shows a message when request in progress', function() {
      var el = this.testEl;
      var service = helpers.fixtureService();
      helpers.renderInto(el, {
        servicesFeed: helpers.oneActiveServiceFeed(),
        discontinueServiceRequests: fromPair(service.id, 'pending')
      });
      expect($(el).find('.btn').text()).toEqual('Updating...');
    });

    it('renders discontinued services correctly', function() {
      var el = this.testEl;
      var discontinuedService = merge(helpers.fixtureService(), {
        discontinued_by_educator_id: 1,
        discontinued_recorded_at: "2016-04-05T01:43:15.256Z"
      });
      helpers.renderInto(el, {
        servicesFeed: {
          active: [],
          discontinued: [discontinuedService]
        }
      });
      expect(el).toContainText('Ended');
      expect(el).toContainText('April 5, 2016');
    });
  });
});
