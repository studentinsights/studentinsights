import SpecSugar from '../support/spec_sugar.jsx';
import Roster from '../../../app/assets/javascripts/components/flexible_roster.jsx';
import renderer from 'react-test-renderer';

describe('Roster', function() {
  
  const ReactDOM = window.ReactDOM;

  const helpers = {
    renderInto: function(el, props) {
      ReactDOM.render(<Roster {...props} />, el);
    }
  };

  const props = {
    columns: [
      { label: 'Test Label 1', key: 'element1'},
      { label: 'Test Label 2', key: 'element2'},
      { label: 'Test Label 3', key: 'element3'}
    ],
    rows: [
      { id: 1, element1: 'Data 1-1', element2: 'Data 1-2', element3: 'Data 1-3'},
      { id: 2, element1: 'Data 2-1', element2: 'Data 2-2', element3: 'Data 2-3'},
      { id: 3, element1: 'Data 3-1', element2: 'Data 3-2', element3: 'Data 3-3'}
    ],
    initialSortIndex: 0
  };

  SpecSugar.withTestEl('high-level integration test', function(container) {
    it('renders the correct headers', function() {
      const el = container.testEl;

      helpers.renderInto(el, props);
      const headers = $(el).find('#roster-header th');

      expect(headers.length).toEqual(3);
      expect(headers[0].innerHTML).toEqual('Test Label 1');
    });

    it('renders the correct data', function() {
      const el = container.testEl;

      helpers.renderInto(el, props);
      const dataElements = $(el).find('#roster-data tr');

      expect(dataElements.length).toEqual(3);

      const firstDataRows = dataElements.eq(0).find('td');
      expect(firstDataRows[0].innerHTML).toEqual('Data 1-1');
    });
  });
  
  
  it('renders correctly', () => {
    const props = {
      columns: [
        { label: 'Test Label 1', key: 'element1'},
        { label: 'Test Label 2', key: 'element2'},
        { label: 'Test Label 3', key: 'element3'}
      ],
      rows: [
        { id: 1, element1: 'Data 1-1', element2: 'Data 1-2', element3: 'Data 1-3'},
        { id: 2, element1: 'Data 2-1', element2: 'Data 2-2', element3: 'Data 2-3'},
        { id: 3, element1: 'Data 3-1', element2: 'Data 3-2', element3: 'Data 3-3'}
      ],
      initialSortIndex: 0
    };
    
    const tree = renderer.create(
      <Roster {...props} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });


});