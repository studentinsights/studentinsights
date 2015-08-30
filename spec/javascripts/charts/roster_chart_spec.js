describe("RosterChart", function() {
  describe(".fromChartData", function() {
    describe("no data", function() {
      it("returns a chart with no series", function() {
        var no_data = $('<div />');
        var chart = RosterChart.fromChartData(no_data);
        expect(chart.series).toEqual([]);
      });
    });
    describe("all risk level 3", function() {
      it("returns a chart with one series and correct data", function() {
        var data = $("<div data-3='4'></div>");
        var chart = RosterChart.fromChartData(data);
        expect(chart.series.length).toEqual(1);
        expect(chart.series[0].data).toEqual([4]);
        expect(chart.series[0].name).toEqual('Risk level 3');
      });
    });
    describe("two data series", function() {
      it("returns a chart with two series and correct data", function() {
        var data = $("<div data-1='1' data-2='2'></div>")
        var chart = RosterChart.fromChartData(data);
        expect(chart.series.length).toEqual(2);
        expect(chart.series[0].data).toEqual([1]);
        expect(chart.series[0].name).toEqual('Risk level 1');
      });
    });
  });
});
