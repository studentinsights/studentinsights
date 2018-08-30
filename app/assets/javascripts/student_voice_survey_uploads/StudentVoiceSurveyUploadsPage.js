import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {AutoSizer, Column, Table, SortDirection} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {updateGlobalStylesToTakeFullHeight} from '../helpers/globalStylingWorkarounds';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import Educator from '../components/Educator';
import * as Routes from '../helpers/Routes';


// Shows a list of uploads of student voice surveys; allow the user to 
// upload a new one.  Intended for a small number of admin users who have access.
export default class StudentVoiceSurveyUploadsPage extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const url = `/admin/api/student_voice_survey_uploads`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="StudentVoiceSurveyUploadsPage" style={styles.flexVertical}>
        <GenericLoader
          style={styles.flexVertical}
          promiseFn={this.fetchJson}
          render={this.renderJson} />
      </div>
    );
  }

  renderJson(json) {
    const {currentEducatorId} = this.props;
    const studentVoiceSurveyUploads = json.student_voice_survey_upload;
    return (
      <StudentVoiceSurveyUploadsPageView
        currentEducatorId={currentEducatorId}
        studentVoiceSurveyUploads={studentVoiceSurveyUploads} />
    );
  }
}
StudentVoiceSurveyUploadsPage.propTypes = {
  currentEducatorId: PropTypes.number.isRequired
};


export class StudentVoiceSurveyUploadsPageView extends React.Component {
  constructor(props) {
    super(props);
    
    // this.state = {
    //   sortBy: 'section_number',
    //   sortDirection: SortDirection.ASC,
    // };
    // this.onTableSort = this.onTableSort.bind(this);
    // this.renderSectionNumber = this.renderSectionNumber.bind(this);
    // this.renderCourseDescription = this.renderCourseDescription.bind(this);
    // this.renderEducators = this.renderEducators.bind(this);
  }

  // orderedSections(sections) {
  //   const {sortBy, sortDirection} = this.state;

  //   // map dataKey to an accessor/sort function
  //   const sortFns = {
  //     fallback(section) { return section[sortBy]; }
  //     // grade(section) { return rankedByGradeLevel(section.grade); },
  //     // school(section) { return section.school.name; },
  //     // name(section) { return `${section.last_name}, ${section.first_name}`; }
  //   };
  //   const sortFn = sortFns[sortBy] || sortFns.fallback;
  //   const sortedRows = _.sortBy(sections, sortFn);

  //   // respect direction
  //   return (sortDirection == SortDirection.DESC) 
  //     ? sortedRows.reverse()
  //     : sortedRows;
  // }

  // onTableSort({defaultSortDirection, event, sortBy, sortDirection}) {
  //   if (sortBy === this.state.sortBy) {
  //     const oppositeSortDirection = (this.state.sortDirection == SortDirection.DESC)
  //       ? SortDirection.ASC
  //       : SortDirection.DESC;
  //     this.setState({ sortDirection: oppositeSortDirection });
  //   } else {
  //     this.setState({sortBy});
  //   }
  // }

  render() {
    const {studentVoiceSurveyUploads} = this.props;
    return (
      <div style={{...styles.flexVertical, margin: 10}}>
        <SectionHeading>Student Voice Survey Uploads</SectionHeading>
        <pre>{JSON.stringify(studentVoiceSurveyUploads, null, 2)}</pre>
      </div>
    );
  }

  // renderTable(sections) {
  //   const {sortDirection, sortBy} = this.state;
  //   const sortedSections = this.orderedSections(sections);
  //   const rowHeight = 30; // ~1.5 line height

  //   // In conjuction with the filtering, this can lead to a warning in development.
  //   // See https://github.com/bvaughn/react-virtualized/issues/1119 for more.
  //   return (
  //     <AutoSizer style={{marginLeft: 10, marginTop: 20}}>
  //       {({width, height}) => (
  //         <Table
  //           width={width}
  //           height={height}
  //           headerHeight={rowHeight}
  //           headerStyle={{display: 'flex', fontWeight: 'bold', cursor: 'pointer'}}
  //           rowStyle={{display: 'flex'}}
  //           style={{fontSize: 14}}
  //           rowHeight={rowHeight}
  //           rowCount={sortedSections.length}
  //           rowGetter={({index}) => sortedSections[index]}
  //           sort={this.onTableSort}
  //           sortBy={sortBy}
  //           sortDirection={sortDirection}
  //           >
  //           <Column
  //             label='Section'
  //             dataKey='section_number'
  //             cellRenderer={this.renderSectionNumber}
  //             width={100}
  //           />
  //           <Column
  //             label='Course'
  //             dataKey='course'
  //             cellRenderer={this.renderCourseDescription}
  //             width={150}
  //             flexGrow={1}
  //           />
  //           <Column
  //             label='Schedule'
  //             dataKey='schedule'
  //             width={150}
  //           />
  //           <Column
  //             label='Term'
  //             dataKey='term_local_id'
  //             width={100}
  //           />
  //           <Column
  //             label='Room'
  //             dataKey='room_number'
  //             width={100}
  //           />
  //           <Column
  //             label='Other teachers'
  //             dataKey='teachers'
  //             cellRenderer={this.renderEducators}
  //             width={250}
  //           />
  //         </Table>
  //       )}
  //     </AutoSizer>
  //   );
  // }

  // renderSectionNumber(cellProps) {
  //   const section = cellProps.rowData;
  //   return (
  //     <a href={Routes.section(section.id)}>
  //       {section.section_number}
  //     </a>
  //   );
  // }
  // renderCourseDescription(cellProps) {
  //   return cellProps.rowData.course.course_description;
  // }

  // renderEducators(cellProps) {
  //   const {currentEducatorId} = this.props;
  //   const otherEducators = cellProps.rowData.educators.filter(educator => {
  //     return educator.id != currentEducatorId;
  //   });
    
  //   return (
  //     <div>
  //       {otherEducators.map(educator => (
  //         <Educator key={educator.id} educator={educator} />
  //       ))}
  //     </div>
  //   );
  // }
}
StudentVoiceSurveyUploadsPageView.propTypes = {
  currentEducatorId: PropTypes.number.isRequired,
  studentVoiceSurveyUploads: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    form_timestamp: PropTypes.string.isRequired,
    first_name: PropTypes.string.isRequired,
    student_lasid: PropTypes.string.isRequired,
    proud: PropTypes.string.isRequired,
    best_qualities: PropTypes.string.isRequired,
    activities_and_interests: PropTypes.string.isRequired,
    nervous_or_stressed: PropTypes.string.isRequired,
    learn_best: PropTypes.string.isRequired,
    student: PropTypes.shape({
      id: PropTypes.number.isRequired,
      first_name: PropTypes.string.isRequired,
      last_name: PropTypes.string.isRequired,
      grade: PropTypes.string
    }).isRequired,
    educator: PropTypes.shape({
      id: PropTypes.number.isRequired,
      full_name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired
    }).isRequired
  })).isRequired
};

const styles = {
  flexVertical: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  }
};