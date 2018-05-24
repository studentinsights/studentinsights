import React from 'react';
import createClass from 'create-react-class';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {baseSortByString, sortByNumber} from '../helpers/SortHelpers';
import FlexibleRoster from '../components/FlexibleRoster';
import * as Routes from '../helpers/Routes';


(function() {
  window.shared || (window.shared = {});

  /*
  Renders the table of sections.
  */
  
  window.shared.StudentSectionsRoster = createClass({
    displayName: 'StudentSectionsRoster',

    propTypes: {
      sections: PropTypes.array,            // Array of sections to display
      linkableSections: PropTypes.array     // Array of section ids to render as links
    },

    formatEducatorNames: function(educators) {
      const educatorNames = _.map(educators, 'full_name');
      return educatorNames.join(' / ');
    },

    styleEducators: function(section, column) {
      return (
        <p>{this.formatEducatorNames(section.educators)}</p>
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

    sortEducatorNames: function(a, b, sortBy) {
      const educatorNamesA = this.formatEducatorNames(a.educators);
      const educatorNamesB = this.formatEducatorNames(b.educators);
      return baseSortByString(educatorNamesA, educatorNamesB);
    },

    render: function() {
      const sections = this.props.sections;
      
      const columns = [
        {label: 'Section Number', key: 'section_number', cell:this.styleSectionNumber},
        {label: 'Course Description', key: 'course_description'},
        {label: 'Grade', key: 'grade_numeric', sortFunc: sortByNumber},
        {label: 'Schedule', key: 'schedule'},
        {label: 'Educators', key: 'educators', cell:this.styleEducators, sortFunc: this.sortEducatorNames},
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