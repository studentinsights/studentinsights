import ReactDOM from 'react-dom';
import SpecSugar from '../support/spec_sugar.jsx';
import SliceButtons from '../../../app/assets/javascripts/components/SliceButtons';

const helpers = {
  renderInto: function(el, props = {}) {
    const mergedProps = {
      ...props,
      students: [],
      filters: [],
      filtersHash: '',
      clearFilters: jest.fn()
    };
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
