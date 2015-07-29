describe("AttendanceChart", function() {
  beforeEach(function() {
    this.generator = function generateChartData () {
      return { series: [ {data: [0, 0, 0] } ] };
    }
    this.attendanceChart = new window.AttendanceChart({ data: this.generator() });
  })

  describe(".fromChartData", function() {
    it("configures an attendance chart with absence and tardy information", function() {
      var chart = AttendanceChart.fromChartData({ data: this.generator });
      expect(chart.series.map(function(s) { return s.name; })).toEqual(["Absences", "Tardies"]);
    })
  })

  describe("#toHighChart", function() {
    it("returns HighChart configuration data", function() {
      var data = { series: [ {data: [0, 0, 0] } ] }
      expect(this.attendanceChart.toHighChart()).toEqual(jasmine.objectContaining({
        series: { data: data }
      }));
    });
  });
});
