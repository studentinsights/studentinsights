import _ from 'lodash';
import SortHelpers from '../helpers/sort_helpers.jsx';
import FlexibleRoster from '../components/flexible_roster.jsx';


(function() {
  window.shared || (window.shared = {});

  const Routes = window.shared.Routes;

  /*
  Renders the table of sections.
  */
  
  window.shared.StudentSectionsRoster = React.createClass({
    displayName: 'StudentSectionsRoster',

    propTypes: {
      sections: React.PropTypes.array,            // Array of sections to display
      linkableSections: React.PropTypes.array     // Array of section ids to render as links
    },

    styleEducators: function(section, column) {
      const educatorNames = _.map(section.educators, 'full_name');
      return (
        <p>{educatorNames.join(' / ')}</p>
      );
    },

    styleSectionNumberLink(section) {
      return (
        <a href={Routes.section(section.id)}>
          {section.section_number}
        </a>
      );
    },

    styleSectionNumberNoLink(section) {
      return (
        <p>{section.section_number}</p>
      );
    },

    styleSectionNumber: function(section, column) {
      const linkableSection = _.includes(this.props.linkableSections, section.id);
      
      return linkableSection ? 
             this.styleSectionNumberLink(section) :
             this.styleSectionNumberNoLink(section);
    },

    render: function() {
      const sections = this.props.sections;
      
      const columns = [
        {label: 'Section Number', key: 'section_number', cell:this.styleSectionNumber},
        {label: 'Course Description', key: 'course_description'},
        {label: 'Grade', key: 'grade_numeric', sortFunc: SortHelpers.sortByNumber},
        {label: 'Schedule', key: 'schedule'},
        {label: 'Educators', key: 'educators', cell:this.styleEducators},
        {label: 'Room', key: 'room_number'},
        {label: 'Term', key: 'term_local_id'}
      ];
      
      return (
        <FlexibleRoster
          rows={sections}
          columns={columns}
          initialSortIndex={0}/>
      );
    },
  });
})();