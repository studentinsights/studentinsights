import ReactDOM from 'react-dom';
import SliceButtons from './SliceButtons';

function testProps(props = {}) {
  return {
    students: [],
    filters: [],
    filtersHash: '',
    clearFilters: jest.fn(),
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(<SliceButtons {...props} />, el);
  expect(el.innerHTML).toContain('Share');
});