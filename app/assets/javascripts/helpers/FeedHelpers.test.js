import * as FeedHelpers from './FeedHelpers';

function testFeed() {
  return {
    deprecated: {
      interventions: [{
        fooIntervention: 'y',
        start_date_timestamp: '2018-12-19T00:00:00.000Z'
      }]
    },
    event_notes: [{
      fooEventNote: 'bar',
      recorded_at: '2018-12-13T00:00:00.000Z'
    }],
    transition_notes: [{
      fooTransitionNote: 'z',
      recorded_at: '2018-12-16T00:00:00.000Z'
    }],
    second_transition_notes: [{
      fooSecondTransitionNote: 'info',
      recorded_at: '2018-12-17T00:00:00.000Z'
    }],
    flattened_forms: [{
      fooFlattenedForm: 'example',
      form_timestamp: '2018-12-15T00:00:00.000Z'
    }],
    bedford_end_of_year_transitions: [{
      fooBedfordTransition: 'yoyoyo',
      form_timestamp: '2018-12-11T00:00:00.000Z'
    }]
  };
}

describe('#mergedNotes', () => {
  it('puts notes of different types in order', () => {
    const feed = testFeed();
    expect(FeedHelpers.mergedNotes(feed)).toEqual([{
      fooIntervention: "y",
      start_date_timestamp: "2018-12-19T00:00:00.000Z",
      sort_timestamp: "2018-12-19T00:00:00.000Z",
      type: "deprecated_interventions",
    }, {  
      recorded_at: "2018-12-17T00:00:00.000Z",
      fooSecondTransitionNote: "info",
      sort_timestamp: "2018-12-17T00:00:00.000Z",
      type: "second_transition_notes",
    }, {
      recorded_at: "2018-12-16T00:00:00.000Z",
      fooTransitionNote: "z",
      sort_timestamp: "2018-12-16T00:00:00.000Z",
      type: "transition_notes",
    }, {
      form_timestamp: "2018-12-15T00:00:00.000Z",
      fooFlattenedForm: "example",
      sort_timestamp: "2018-12-15T00:00:00.000Z",
      type: "flattened_forms",
    }, {
      fooEventNote: "bar",
      sort_timestamp: "2018-12-13T00:00:00.000Z",
      recorded_at: "2018-12-13T00:00:00.000Z",
      type: "event_notes",
    }, {
      fooBedfordTransition: 'yoyoyo',
      form_timestamp: '2018-12-11T00:00:00.000Z',
      sort_timestamp: '2018-12-11T00:00:00.000Z',
      type: "bedford_end_of_year_transitions",
    }]);
  });
});
