import SpecSugar from '../support/spec_sugar.jsx';
import {merge} from '../../../app/assets/javascripts/helpers/ReactHelpers';

describe('ProfileBarCharts', function() {
  const ProfileBarChart = window.shared.ProfileBarChart;
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge({
        events: [],
        id: 'foo-id',
        titleText: 'foo-title',
        monthsBack: 48,
        nowMomentUTC: moment.utc('2017-02-02T13:23:15+00:00')
      }, props || {});
      ReactDOM.render(<ProfileBarChart {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('integration tests', function(container) {
    it('is wrapped in a div with the given id', function() {
      const el = container.testEl;
      helpers.renderInto(el, {id: 'foo'});

      const div = $(el).children().first();
      expect(div.attr('id')).toEqual("foo");
    });

  });
});
