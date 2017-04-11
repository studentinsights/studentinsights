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
    }
  };

  SpecSugar.withTestEl('integration tests', function() {
    it('is wrapped in a div with the given id', function() {
      var el = this.testEl;
      helpers.renderInto(el, {id: 'foo'});

      var div = $(el).children().first();
      expect(div.attr('id')).toEqual("foo");
    });

  });
});
