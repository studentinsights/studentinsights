describe('ProfileBarCharts', function() {
  var ProfileChart = window.shared.ProfileChart;

  describe('#getSchoolYearStartPositions', function(){
    it('works', function(){
        expect(
            ProfileChart.prototype.getSchoolYearStartPositions(28, moment.utc("2016-09-10"), 5)
        ).toEqual(
            _.object([
                [moment.utc("2016-08-15").valueOf(), "2016<br><b>Grade 5</b>"],
                [moment.utc("2015-08-15").valueOf(), "2015<br><b>Grade 4</b>"],
                [moment.utc("2014-08-15").valueOf(), "2015<br><b>Grade 3</b>"]
            ])
        );
    })
  });
});