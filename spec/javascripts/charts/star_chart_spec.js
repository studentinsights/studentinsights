describe("StarChart", function() {

  describe(".fromChartData", function() {
    describe("no data series", function() {
      it("returns a new chart with no series", function() {
        var two_empty_series = $('<div data-star-series-math-percentile="null" data-star-series-reading-percentile="null"></div>');
        var chart = StarChart.fromChartData(two_empty_series);
        expect(chart.series).toEqual([]);
      });
    });
    describe("one data series", function() {
      it("returns a new chart with one series", function() {
        var one_empty_series = $('<div data-star-series-math-percentile="[[2015,1,1,10]]" data-star-series-reading-percentile="null"></div>');
        var chart = StarChart.fromChartData(one_empty_series);
        var math_series = chart.series[0];
        expect(math_series.data[0][1]).toEqual(10);
      });
    });
    describe("two data series", function() {
      it("returns a new chart with both series", function() {
        var zero_empty_series = $('<div data-star-series-math-percentile="[[2015,1,1,20]]" data-star-series-reading-percentile="[[2015,1,1,100]]"></div>');
        var chart = StarChart.fromChartData(zero_empty_series);
        var math_series = chart.series[0];
        expect(math_series.data[0][1]).toEqual(20);
      });
    });
  });
});
