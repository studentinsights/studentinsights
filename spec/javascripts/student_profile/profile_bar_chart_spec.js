describe('ProfileBarCharts', function() {
  var ProfileBarChart = window.shared.ProfileBarChart;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var SpecSugar = window.shared.SpecSugar;

  var helpers = {
    renderInto: function(el, props) {
      var mergedProps = merge({
        events: [],
        id: 'foo-id',
        titleText: 'foo-title',
        monthsBack: 48,
        nowMomentUTC: moment.utc('2017-02-02T13:23:15+00:00')
      }, props || {});
      return ReactDOM.render(createEl(ProfileBarChart, mergedProps), el);
    },
    namedEvents: function() {
      return {
        A: {occurred_at: '2015-03-13T15:13:28.176Z'},
        B: {occurred_at: '2015-03-16T04:18:00.271Z'},
        C: {occurred_at: '2014-10-28T16:04:54.366Z'},
        D: {occurred_at: '2014-02-22T16:43:11.113Z'}
      };
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('is wrapped in a div with the given id', function() {
      var el = this.testEl;
      helpers.renderInto(el, {id: 'foo'});

      var div = $(el).children().first();
      expect(div.attr('id')).toEqual("foo");
    });

    describe('#monthKeys', function() {
      it('works looking back four years', function(){
        var instance = helpers.renderInto(this.testEl, {});
        var monthKeys = instance.monthKeys(instance.props.nowMomentUTC, 48);
        expect(monthKeys.length).toEqual(48 + 1);
        expect(monthKeys[0]).toEqual('20130201');
        expect(monthKeys[48]).toEqual('20170201');
      });
    });

    describe('#eventsToMonthBuckets', function() {
      it('works on happy path', function(){
        var nowMomentUTC = moment.utc('2015-03-30');
        var namedEvents = helpers.namedEvents();
        var instance = helpers.renderInto(this.testEl, { nowMomentUTC: nowMomentUTC });
        var monthKeys = instance.monthKeys(nowMomentUTC, 12);
        var monthBuckets = instance.eventsToMonthBuckets(monthKeys, _.values(namedEvents));

        // Expect only two buckets to have events, and the others to be empty
        expect(monthKeys.length).toEqual(12 + 1);
        expect(monthBuckets.length).toEqual(monthKeys.length);
        expect(_.compact(_.map(monthBuckets, 'length')).length).toEqual(2);
        expect(monthBuckets[7]).toEqual([namedEvents.C])
        expect(monthBuckets[12]).toEqual([namedEvents.A, namedEvents.B])
      });
    });

    describe('#yearCategories', function() {
      it('works on simple case', function(){
        var instance = helpers.renderInto(this.testEl);
        var categories = instance.yearCategories(['20141101', '20141201', '20150101', '20150201']);
        expect(categories).toEqual({ 2: '2015'});
      });

      it('works with default props', function(){
        var instance = helpers.renderInto(this.testEl);
        var monthKeys = instance.monthKeys(instance.props.nowMomentUTC, instance.props.monthsBack);
        var categories = instance.yearCategories(monthKeys);
        expect(categories).toEqual({
          11: '2014',
          23: '2015',
          35: '2016',
          47: '2017'
        });
      });
    });
  });
});
