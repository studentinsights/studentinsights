import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';
import {studentProfile} from './fixtures/fixtures';
import {withDefaultNowContext} from '../testing/NowContainer';
import ServicesList from './ServicesList';

function testProps(props = {}) {
  return {
    servicesFeed: {
      active: [],
      discontinued: []
    },
    educatorsIndex: studentProfile.educatorsIndex,
    serviceTypesIndex: studentProfile.serviceTypesIndex,
    discontinueServiceRequests: {},
    onClickDiscontinueService: jest.fn(),
    servicesInfoDocUrl: 'https://example.com/info',
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<ServicesList {...props} />), el);
  return {el};
}

const helpers = {
  emptyServicesFeed() {
    return { active: [], discontinued: [] };
  },

  oneActiveServiceFeed() {
    return {
      active: [helpers.fixtureService()],
      discontinued: []
    };
  },

  fixtureService() {
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
  }
};

describe('high-level integration tests', () => {
  it('renders message when no services', () => {
    const {el} = testRender(testProps({ servicesFeed: helpers.emptyServicesFeed() }));
    expect($(el).text()).toContain('No services');
  });

  it('renders everything on the happy path', () => {
    const {el} = testRender(testProps({
      servicesFeed: helpers.oneActiveServiceFeed(),
    }));
    expect($(el).text()).toContain('Reading intervention');
    expect($(el).text()).toContain('With');
    expect($(el).text()).toContain('Started April 3, 2016');
    expect($(el).text()).toContain('Discontinue');
    expect($(el).find('.LightHelpBubble-question-mark').length).toEqual(1);
  });

  it('no service info if servicesInfoDocUrl not set', () => {
    const {el} = testRender(testProps({ servicesInfoDocUrl: null }));
    expect($(el).find('.LightHelpBubble-question-mark').length).toEqual(0);
  });

  it('asks for confirmation before discontinuing', () => {
    const {el} = testRender(testProps({ servicesFeed: helpers.oneActiveServiceFeed() }));
    ReactTestUtils.Simulate.click($(el).find('.btn').get(0));
    expect($(el).text()).toContain('Confirm');
    expect($(el).text()).toContain('Cancel');
  });

  it('shows a message when request in progress', () => {
    const service = helpers.fixtureService();
    const {el} = testRender(testProps({
      servicesFeed: helpers.oneActiveServiceFeed(),
      discontinueServiceRequests: {
        [service.id]: 'pending'
      }
    }));
    expect($(el).find('.btn').text()).toEqual('Updating...');
  });

  it('renders discontinued services correctly', () => {
    const discontinuedService = {
      ...helpers.fixtureService(),
      discontinued_by_educator_id: 1,
      discontinued_recorded_at: "2016-04-05T01:43:15.256Z"
    };
    const {el} = testRender(testProps({
      servicesFeed: {
        active: [],
        discontinued: [discontinuedService]
      }
    }));
    expect($(el).text()).toContain('Ended');
    expect($(el).text()).toContain('April 5, 2016');
  });
});
