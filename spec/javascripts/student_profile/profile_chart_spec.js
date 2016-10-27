describe('ProfileBarCharts', function() {
  var ProfileChart = window.shared.ProfileChart;

  describe('#getSchoolYearStartPositions', function(){
    it('works', function(){
        expect(
            ProfileChart.prototype.getSchoolYearStartPositions(24, moment.utc("2016-09-10"), 5)
        ).toEqual(
            _.object([
                [moment.utc("2016-08-15").valueOf(), "<b>Grade 5<br>started</b>"],
                [moment.utc("2015-08-15").valueOf(), "<b>Grade 4<br>started</b>"],
                [moment.utc("2014-08-15").valueOf(), "<b>Grade 3<br>started</b>"]
            ])
        );
    })
  });
});
