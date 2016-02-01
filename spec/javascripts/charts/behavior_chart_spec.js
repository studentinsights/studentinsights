describe("BehaviorChart", function() {
  beforeEach(function() {
    this.generator = function generateChartData () {
      return { series: [ {data: [0, 0, 0] } ] };
    }
    this.behaviorChart = new window.BehaviorChart({ data: this.generator() });
  });
  afterEach(function() {
    $('#chart').remove();
  });

  describe(".fromChartData", function() {
    it("configures an behavior chart with Behavior Incidents", function() {
      var chart = BehaviorChart.fromChartData({ data: this.generator });
      expect(chart.series.map(function(s) { return s.name; })).toEqual(["Behavior Incidents"]);
    })
  })

  describe("#toHighChart", function() {
    it("returns HighChart configuration data", function() {
      var data = { series: [ {data: [0, 0, 0] } ] }
      expect(this.behaviorChart.toHighChart()).toEqual(jasmine.objectContaining({
        series: { data: data }
      }));
    });
  });
});
