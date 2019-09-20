import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import FlexibleRoster from '../components/FlexibleRoster';
import SectionHeading from '../components/SectionHeading';
import SectionNavigator from './SectionNavigator';
import {
  baseSortByString,
  sortByCustomEnum,
  sortByDate,
  sortByNumber
} from '../helpers/SortHelpers';
import {eventNoteTypeTextMini} from '../helpers/eventNoteType';
import {includeSectionGrade, studentTableEventNoteTypeIds} from '../helpers/PerDistrict';
import {mergeLatestNoteDateTextFields} from '../helpers/latestNote';
import * as Routes from '../helpers/Routes';
import StudentPhotoCropped from '../components/StudentPhotoCropped';


// Show a section roster for a high school course.
export default class SectionView extends React.Component {
  eventNoteTypeIds() {
    const {districtKey} = this.context;
    const schoolType = 'HS';
    return studentTableEventNoteTypeIds(districtKey, schoolType);
  }

  render() {
    const {section, sections} = this.props;
    const spacerEl = <span>•</span>;
    return (
      <div className="SectionView" style={styles.flexVertical}>
        <SectionHeading titleStyle={styles.sectionTitleStyle}>
          <span style={styles.nameAndInfo}>
            <span>{section.course_description} {'(' + section.section_number + ')'}</span>
            <span style={styles.sectionInfo}>
              <span>Room {section.room_number || '(not set)'} {spacerEl}</span>
              <span>Schedule {section.schedule || '(not set)'} {spacerEl}</span>
              <span>Term {section.term_local_id || '(not set)'}</span>
            </span>
          </span>
          <SectionNavigator
            style={styles.navigator}
            sections={sections}
          />
        </SectionHeading>
        <div style={styles.table}>
          {this.renderTable()}
        </div>
      </div>
    );
  }

  renderTable() {
    const {districtKey} = this.context;
    const {students} = this.props;
    const eventNoteTypeIds = studentTableEventNoteTypeIds(districtKey, 'HS');
    const includeGrade = includeSectionGrade(districtKey);

    // data and columns
    const studentsWithComputedFields = students.map(student => mergeLatestNoteDateTextFields(student, student.event_notes_without_restricted, eventNoteTypeIds));
    const columns = _.compact([
      {label: 'Name', key: 'first_name', cell:this.renderStudentName, sortFunc: nameSorter},
      {label: '', key: 'photo', cell:this.renderPhoto, sortFunc: nameSorter},

      // Supports
      ...eventNoteTypeIds.map(eventNoteTypeId => (
        {label: `Last ${eventNoteTypeTextMini(eventNoteTypeId)}`, group: 'Supports', key: `latest_note_${eventNoteTypeId}_date_text`, sortFunc: sortByDate}
      )),

      {label: 'Program Assigned', key: 'program_assigned', sortFunc: programSorter},
      
      // SPED & Disability
      {label: 'Disability', group: 'SPED & Disability', key: 'disability'},
      {label: '504 Plan', group: 'SPED & Disability', key: 'plan_504'},

      // Language
      {label: 'Fluency', group: 'Language', key: 'limited_english_proficiency', sortFunc: languageProficiencySorter},
      {label: 'Home Language', group: 'Language', key: 'home_language'},

      // Grade optional
      (includeGrade ? {label: 'Grade', key: 'grade_numeric', sortFunc: sortByNumber} : null),

      {label: 'Absences', key: 'most_recent_school_year_absences_count', sortFunc: sortByNumber},
      {label: 'Tardies', key: 'most_recent_school_year_tardies_count', sortFunc: sortByNumber},
      {label: 'Discipline Incidents', key: 'most_recent_school_year_discipline_incidents_count', sortFunc: sortByNumber},

      // STAR: Math
      {label: 'Percentile', group: 'STAR: Math', key:'most_recent_star_math_percentile', sortFunc: sortByNumber},

      // STAR: Reading
      {label: 'Percentile', group: 'STAR: Reading', key:'most_recent_star_reading_percentile', sortFunc: sortByNumber},

      // MCAS: Math
      {label: 'Performance', group: 'MCAS: Math', key:'most_recent_mcas_math_performance', sortFunc: mcasPerformanceSorter},
      {label: 'Score', group: 'MCAS: Math', key:'most_recent_mcas_math_scaled', sortFunc: sortByNumber},

      // MCAS: ELA
      {label: 'Performance', group: 'MCAS: ELA', key:'most_recent_mcas_ela_performance', sortFunc: mcasPerformanceSorter},
      {label: 'Score', group: 'MCAS: ELA', key:'most_recent_mcas_ela_scaled', sortFunc: sortByNumber}
    ]);

    return (
      <FlexibleRoster
        rows={studentsWithComputedFields}
        columns={columns}
        initialSortIndex={0}/>
    );
  }

  renderStudentName(student, column) {
    return (
      <a href={Routes.studentProfile(student.id)}>
        {student.last_name + ', ' + student.first_name}
      </a>
    );
  }

  renderPhoto(student, column) {
    return student.has_photo && <StudentPhotoCropped studentId={student.id} />;
  }
}
SectionView.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
SectionView.propTypes = {
  students: PropTypes.arrayOf(PropTypes.shape({
    last_name: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    has_photo: PropTypes.bool.isRequired,
    event_notes_without_restricted: PropTypes.arrayOf(PropTypes.object).isRequired
  })).isRequired,
  sections: PropTypes.arrayOf(PropTypes.object).isRequired,
  section: PropTypes.object.isRequired
};


const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  nameAndInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  sectionInfo: {
    fontSize: 14,
    paddingTop: 5,
    paddingLeft: 1
  },
  sectionTitleStyle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navigator: {
    margin: 10,
    fontSize: 14
  },
  table: {
    paddingTop: 20
  }
};


function nameSorter(a, b, sortBy) {
  const stringA = a['last_name'] + a['first_name'];
  const stringB = b['last_name'] + b['first_name'];

  return baseSortByString(stringA, stringB);
}

function programSorter(a, b, sortBy) {
  return sortByCustomEnum(a,b,sortBy,['Reg Ed', '2Way English', '2Way Spanish', 'Sp Ed']);
}

function languageProficiencySorter(a, b, sortBy) {
  return sortByCustomEnum(a,b,sortBy,['FLEP-Transitioning', 'FLEP', 'Fluent']);
}

function mcasPerformanceSorter(a, b, sortBy) {
  return sortByCustomEnum(a,b,sortBy,['A','P','NI','W','F']);
}