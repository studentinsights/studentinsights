import SpecSugar from '../support/spec_sugar.jsx';


describe('SliceButtons', function() {
  const merge = window.shared.ReactHelpers.merge;
  const ReactDOM = window.ReactDOM;
  const SliceButtons = window.shared.SliceButtons;

  const helpers = {
    renderInto: function(el, props) {
      const mergedProps = merge({
        students: [],
        filters: [],
        filtersHash: '',
        clearFilters: jasmine.createSpy('clearFilters')
      }, props || {});
      ReactDOM.render(<SliceButtons {...mergedProps} />, el);
    }
  };

  SpecSugar.withTestEl('high-level integration tests', function(container) {
    it('renders everything on the happy path', function() {
      const el = container.testEl;
      helpers.renderInto(el);

      expect(el.innerHTML).toContain('Share');
    });
  });
});
