import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {baseSortByString, sortByNumber, sortByCustomEnum} from '../helpers/SortHelpers';
import FlexibleRoster from '../components/FlexibleRoster';
import * as Routes from '../helpers/Routes';


/*
Renders the table of sections.
*/

export default class StudentSectionsRoster extends React.Component {
  constructor(props) {
    super(props);
    
    this.renderSectionNumber = this.renderSectionNumber.bind(this);
    this.renderEducators = this.renderEducators.bind(this);
    this.sortEducatorNames = this.sortEducatorNames.bind(this);
  }

  sortEducatorNames(a, b, sortBy) {
    const educatorNamesA = this.formatEducatorNames(a.educators);
    const educatorNamesB = this.formatEducatorNames(b.educators);
    return baseSortByString(educatorNamesA, educatorNamesB);
  }

  sortTerm(a, b, sortBy) {
    return sortByCustomEnum(a, b, sortBy, [
      '9', 'FY',  // all year
      '1', 'S1', 'Q1', 'Q2', // first semester or first two quarters
      '2', 'S2', 'Q3', 'Q4' // second semester of last two quarters
    ]);
  }

  render() {
    const sections = this.props.sections;
    
    const columns = [
      {label: 'Section Number', key: 'section_number', cell:this.renderSectionNumber},
      {label: 'Course Description', key: 'course_description'},
      {label: 'Grade', key: 'grade_numeric', sortFunc: sortByNumber},
      {label: 'Schedule', key: 'schedule'},
      {label: 'Educators', key: 'educators', cell: this.renderEducators, sortFunc: this.sortEducatorNames},
      {label: 'Room', key: 'room_number'},
      {label: 'Term', key: 'term_local_id', sortFunc: this.sortTerm}
    ];
    
    return (
      <FlexibleRoster className="StudentSectionsRoster"
        rows={sections}
        columns={columns}
        initialSortIndex={6}/>
    );
  }

  renderSectionNumber(section, column) {
    const linkableSection = _.includes(this.props.linkableSections, section.id);
    
    return linkableSection ? 
           this.renderSectionNumberLink(section) :
           this.renderSectionNumberNoLink(section);
  }

  renderSectionNumberLink(section) {
    return (
      <a href={Routes.section(section.id)}>
        {section.section_number}
      </a>
    );
  }

  renderSectionNumberNoLink(section) {
    return (
      <p>{section.section_number}</p>
    );
  }

  renderEducators(section, column) {
    return (
      <p>{this.renderEducatorNames(section.educators)}</p>
    );
  }

  renderEducatorNames(educators) {
    const educatorNames = _.map(educators, 'full_name');
    return educatorNames.join(' / ');
  }
}
StudentSectionsRoster.propTypes = {
  sections: PropTypes.array,            // Array of sections to display
  linkableSections: PropTypes.array     // Array of section ids to render as links
};
