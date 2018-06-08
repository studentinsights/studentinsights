import ReactDOM from 'react-dom';
import SpecSugar from '../support/spec_sugar.jsx';
import SectionHeading from '../../../app/assets/javascripts/components/SectionHeading';


SpecSugar.withTestEl('high-level integration tests', function(container) {
  it('renders everything on the happy path', function() {
    const el = container.testEl;
    ReactDOM.render(<SectionHeading>foo</SectionHeading>, el);
    expect($(el).find('h4').length).toEqual(1);
    expect(el.innerHTML).toContain('foo');
  });
});
