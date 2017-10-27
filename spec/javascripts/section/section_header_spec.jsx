import renderer from 'react-test-renderer';
import SectionHeader from '../../../app/assets/javascripts/section/section_header.jsx';

describe('SectionHeader', function() {
  
  it('renders correctly', () => {
    const props = {
      educators: [
        { }
      ],
      sections: [
        { id: 1, section_number: 'Art-1'},
        { id: 2, section_number: 'Art-2'},
        { id: 3, section_number: 'Art-3'}
      ],
      section: { id: 1, section_number: 'Art-1', course_number: 'Art', course_description: 'Awesome Art Class', term_local_id: '9', schedule: '3(M-R)', room_number: '304' },
    };
    
    const tree = renderer.create(
      <SectionHeader {...props} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

/*

propTypes: {
    section: React.PropTypes.object.isRequired,
    sections: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
  },

*/