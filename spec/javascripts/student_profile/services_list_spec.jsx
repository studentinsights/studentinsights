import {studentProfile} from './fixtures.jsx';
import SpecSugar from '../support/spec_sugar.jsx';

describe('ServicesList', function() {
  const ReactDOM = window.ReactDOM;
  const ServicesList = window.shared.ServicesList;

  const helpers = {
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
      const mergedProps = {
        servicesFeed: {
          active: [],
          discontinued: []
        },
        educatorsIndex: studentProfile.educatorsIndex,
        serviceTypesIndex: studentProfile.serviceTypesIndex,
        discontinueServiceRequests: {},
        onClickDiscontinueService: jest.fn(),
        ...props
      };
      ReactDOM.render(<ServicesList {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function(container) {
    it('renders message when no services', function() {
      const el = container.testEl;
      helpers.renderInto(el, { servicesFeed: helpers.emptyServicesFeed() });
      expect($(el).text()).toContain('No services');
    });

    it('renders everything on the happy path', function() {
      const el = container.testEl;
      helpers.renderInto(el, { servicesFeed: helpers.oneActiveServiceFeed() });
      expect($(el).text()).toContain('Reading intervention');
      expect($(el).text()).toContain('With');
      expect($(el).text()).toContain('Started April 3, 2016');
      expect($(el).text()).toContain('Discontinue');
    });

    it('asks for confirmation before discontinuing', function() {
      const el = container.testEl;
      helpers.renderInto(el, { servicesFeed: helpers.oneActiveServiceFeed() });
      $(el).find('.btn').click();
      expect($(el).text()).toContain('Confirm');
      expect($(el).text()).toContain('Cancel');
    });

    it('shows a message when request in progress', function() {
      const el = container.testEl;
      const service = helpers.fixtureService();
      helpers.renderInto(el, {
        servicesFeed: helpers.oneActiveServiceFeed(),
        discontinueServiceRequests: {
          [service.id]: 'pending'
        }
      });
      expect($(el).find('.btn').text()).toEqual('Updating...');
    });

    it('renders discontinued services correctly', function() {
      const el = container.testEl;
      const discontinuedService = {
        ...helpers.fixtureService(),
        discontinued_by_educator_id: 1,
        discontinued_recorded_at: "2016-04-05T01:43:15.256Z"
      };
      helpers.renderInto(el, {
        servicesFeed: {
          active: [],
          discontinued: [discontinuedService]
        }
      });
      expect($(el).text()).toContain('Ended');
      expect($(el).text()).toContain('April 5, 2016');
    });
  });
});
