describe("InterventionPlotBand", function() {

  describe(".toHighChartsDate", function() {
    describe("good input", function() {
      it("returns a correct JavaScript UTC date for HighCharts", function() {
        var input = { year: 2015, month: 8, day: 14 };
        var high_charts_date = InterventionPlotBand.toHighChartsDate(input);
        expect(high_charts_date).toEqual(1439510400000);
        expect(new Date(high_charts_date).toGMTString()).toEqual('Fri, 14 Aug 2015 00:00:00 GMT');
      });
    });
  });
  describe("#toHighCharts", function() {
    describe("good input", function() {
      it("returns a correct HighCharts configuration", function() {
        var attributes = { name: "Extra math help",
          start_date: { year: 2015, month: 8, day: 14 },
          end_date: { year: 2015, month: 8, day: 15 }
        };
        var intervention_plot_band = new InterventionPlotBand(attributes);
        var to_highcharts = intervention_plot_band.toHighCharts();
        expect(to_highcharts.label.text).toEqual('Extra math help');
        expect(to_highcharts.from).toEqual(1439510400000);
        expect(to_highcharts.to).toEqual(1439596800000);
      });
    });
  });
});
