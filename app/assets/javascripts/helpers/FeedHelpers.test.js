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
      created_at: '2018-12-16T00:00:00.000Z'
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
      created_at: "2018-12-16T00:00:00.000Z",
      fooTransitionNote: "z",
      sort_timestamp: "2018-12-16T00:00:00.000Z",
      type: "transition_notes",
    }, {
      fooEventNote: "bar",
      sort_timestamp: "2018-12-13T00:00:00.000Z",
      recorded_at: "2018-12-13T00:00:00.000Z",
      type: "event_notes",
    }]);
  });
});
