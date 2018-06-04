import _ from 'lodash';
import * as GraphHelpers from './GraphHelpers';

const helpers = {
  namedEvents: () => {
    return {
      A: {occurred_at: '2015-03-13T15:13:28.176Z'},
      B: {occurred_at: '2015-03-16T04:18:00.271Z'},
      C: {occurred_at: '2014-10-28T16:04:54.366Z'},
      D: {occurred_at: '2014-02-22T16:43:11.113Z'}
    };
  }
};

describe('#monthKeys', () => {
  it('works looking back four years', function(){
    const nowMomentUTC = moment.utc("20170211", "YYYYMMDD");
    const monthKeys = GraphHelpers.monthKeys(nowMomentUTC, 48);
    expect(monthKeys.length).toEqual(48 + 1);
    expect(monthKeys[0]).toEqual('20130201');
    expect(monthKeys[48]).toEqual('20170201');
  });
});

describe('#eventsToMonthBuckets', () => {
  it('works on happy path', function(){
    const nowMomentUTC = moment.utc('2015-03-30');
    const namedEvents = helpers.namedEvents();
    const monthKeys = GraphHelpers.monthKeys(nowMomentUTC, 12);
    const monthBuckets = GraphHelpers.eventsToMonthBuckets(monthKeys, _.values(namedEvents));

    // Expect only two buckets to have events, and the others to be empty
    expect(monthKeys.length).toEqual(12 + 1);
    expect(monthBuckets.length).toEqual(monthKeys.length);
    expect(_.compact(_.map(monthBuckets, 'length')).length).toEqual(2);
    expect(monthBuckets[7]).toEqual([namedEvents.C]);
    expect(monthBuckets[12]).toEqual([namedEvents.A, namedEvents.B]);
  });
});

describe('#yearCategories', () => {
  it('works on simple case', function(){
    const categories = GraphHelpers.yearCategories(['20141101', '20141201', '20150101', '20150201']);
    expect(categories).toEqual({ 2: '2015'});
  });

  it('works with default props', function(){
    const nowMomentUTC = moment.utc('2017-02-02T13:23:15+00:00');
    const monthKeys = GraphHelpers.monthKeys(nowMomentUTC, 48);
    const categories = GraphHelpers.yearCategories(monthKeys);
    expect(categories).toEqual({
      11: '2014',
      23: '2015',
      35: '2016',
      47: '2017'
    });
  });
});
