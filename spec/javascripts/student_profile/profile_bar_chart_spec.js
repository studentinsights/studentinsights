describe('ProfileBarCharts', function() {
  var ProfileBarChart = window.shared.ProfileBarChart;

  describe('#lastNMonthNamesFrom', function(){
    it('works when this test was written', function(){
      expect(
        ProfileBarChart.prototype.lastNMonthNamesFrom(4, moment.utc("2016-04-27"))
      ).toEqual(
        ["Jan", "Feb", "Mar", "Apr"]
      );
    });
    it('works on the first of a month', function(){
      expect(
        ProfileBarChart.prototype.lastNMonthNamesFrom(2, moment.utc("2015-11-01"))
      ).toEqual(
        ["Oct", "Nov"]
      );
    });
    it('works on the first of a year', function(){
      expect(
        ProfileBarChart.prototype.lastNMonthNamesFrom(7, moment.utc("2020-01-01"))
      ).toEqual(
        ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
      );
    });
  });

  describe('#eventsToSparseArray', function(){
    var A = {occurred_at: "2015-03-13T15:13:28.176Z"};
    var B = {occurred_at: "2015-03-16T04:18:00.271Z"};
    var C = {occurred_at: "2014-10-28T16:04:54.366Z"};
    var D = {occurred_at: "2014-09-22T16:43:11.113Z"};

    it('works in a typical case', function(){
      expect(
        ProfileBarChart.prototype.eventsToSparseArray([A, B, C, D], 6, moment.utc("2015-03-30"))
      ).toEqual(
        [[C], [], [], [], [], [A, B]]
      );
    });
  });

  describe('#getYearStartPositions', function(){
    it('works in a typical case', function(){
      expect(
        ProfileBarChart.prototype.getYearStartPositions(18, moment.utc("2018-02-15"))
      ).toEqual(
        {4: "2017", 16: "2018"}
      );
    });

    it('works on the first of a year', function(){
      expect(
        ProfileBarChart.prototype.getYearStartPositions(5, moment.utc("2018-01-01"))
      ).toEqual(
        {4: "2018"}
      );
    });
  });
});