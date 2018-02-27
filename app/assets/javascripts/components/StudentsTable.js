import React from 'react';
import SortHelpers from '../helpers/sort_helpers.jsx';
import {shouldDisplay} from '../helpers/customization_helpers.js';
import {latestNoteDateText} from '../helpers/latestNoteDateText';
import * as Routes from '../helpers/Routes';


// Renders a table of students.
class StudentsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'last_name',
      sortType: 'string',
      sortDesc: true
    };
    this.onClickHeader = this.onClickHeader.bind(this);
  }

  studentsWithComputedFields() {
    return this.props.students.map(student => {
      const latestSstDateText = latestNoteDateText(300, student.event_notes);
      const latestMtssDateText = latestNoteDateText(301, student.event_notes);
      const latestNgeDateText = latestNoteDateText(305, student.event_notes);
      const latest10geDateText = latestNoteDateText(306, student.event_notes);
      return {
        ...student,
        latestSstDateText,
        latestMtssDateText,
        latestNgeDateText,
        latest10geDateText
      };
    });
  }

  orderedStudents() {
    const sortedStudents = this.sortedStudents();

    if (!this.state.sortDesc) return sortedStudents.reverse();

    return sortedStudents;
  }

  sortedStudents() {
    const students = this.studentsWithComputedFields();
    const sortBy = this.state.sortBy;
    const sortType = this.state.sortType;
    let customEnum;

    switch(sortType) {
    case 'string':
      return students.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
    case 'number':
      return students.sort((a, b) => SortHelpers.sortByNumber(a, b, sortBy));
    case 'date':
      return students.sort((a, b) => SortHelpers.sortByDate(a, b, sortBy));
    case 'free_reduced_lunch':
      return students.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
    case 'grade':
      customEnum = ['PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'sped_level_of_need':
      customEnum = ['—', 'Low < 2', 'Low >= 2', 'Moderate', 'High'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'limited_english_proficiency':
      customEnum = ['FLEP-Transitioning', 'FLEP', 'Fluent'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'program_assigned':
      customEnum = ['Reg Ed', '2Way English', '2Way Spanish', 'Sp Ed'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'active_services':
      return students.sort((a, b) => SortHelpers.sortByActiveServices(a, b));
    default:
      return students;
    }
  }

  headerClassName(sortBy) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortBy !== this.state.sortBy) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  }

  onClickHeader(sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  }

  render() {
    const {school} = this.props;
    return (
      <div className='StudentsTable'>
        <table className='students-table' style={{ width: '100%' }}>
          <thead>
            <tr>
              {this.renderHeader('Name', 'last_name', 'string')}
              {this.renderHeader('Last SST', 'latestSstDateText', 'date')}
              {school.school_type === 'ESMS' && this.renderHeader('Last MTSS', 'latestMtssDateText', 'date')}
              {school.school_type === 'HS' && this.renderHeader('Last NGE', 'latestNgeDateText', 'date')}
              {school.school_type === 'HS' && this.renderHeader('Last 10GE', 'latest10geDateText', 'date')}
              {this.renderHeader('Grade', 'grade', 'grade')}
              {shouldDisplay('house', school) && this.renderHeader('House', 'house', 'string')}
              {shouldDisplay('counselor', school) && this.renderHeader('Counselor', 'counselor', 'string')}
              {this.renderHeader('Homeroom', 'homeroom_id', 'number')}
              {this.renderHeader('Disability', 'sped_level_of_need', 'sped_level_of_need')}
              {this.renderHeader('Low Income', 'free_reduced_lunch', 'free_reduced_lunch')}
              {this.renderHeader('LEP', 'limited_english_proficiency', 'limited_english_proficiency')}
              {this.renderHeader('STAR Reading', 'most_recent_star_reading_percentile', 'number')}
              {this.renderHeader('MCAS ELA', 'most_recent_mcas_ela_scaled', 'number')}
              {this.renderHeader('STAR Math', 'most_recent_star_math_percentile', 'number')}
              {this.renderHeader('MCAS Math', 'most_recent_mcas_math_scaled', 'number')}
              {this.renderHeader('Discipline Incidents', 'discipline_incidents_count', 'number')}
              {this.renderHeader('Absences', 'absences_count', 'number')}
              {this.renderHeader('Tardies', 'tardies_count', 'number')}
              {this.renderHeader('Services', 'active_services', 'active_services')}
              {this.renderHeader('Program', 'program_assigned', 'program_assigned')}
            </tr>
          </thead>
          <tbody>
            {this.orderedStudents().map(student => {
              return (
                <tr key={student.id}>
                  <td>
                    <a href={Routes.studentProfile(student.id)}>
                      {student.last_name}, {student.first_name}
                    </a>
                  </td>
                  <td>{student.latestSstDateText}</td>
                  {school.school_type === 'ESMS' && <td>{student.latestMtssDateText}</td>}
                  {school.school_type === 'HS' && <td>{student.latestNgeDateText}</td>}
                  {school.school_type === 'HS' && <td>{student.latest10geDateText}</td>}
                  <td>{student.grade}</td>
                  {shouldDisplay('house', school) && (<td>{student.house}</td>)}
                  {shouldDisplay('counselor', school) && (<td>{student.counselor}</td>)}
                  <td>
                    <a href={Routes.homeroom(student.homeroom_id)}>{student.homeroom_name}</a>
                  </td>
                  <td>{this.renderUnless('None', student.sped_level_of_need)}</td>
                  <td style={{width: '2.5em'}}>{this.renderUnless('Not Eligible', student.free_reduced_lunch)}</td>
                  <td style={{width: '2.5em'}}>{this.renderUnless('Fluent', student.limited_english_proficiency)}</td>
                  {this.renderNumberCell(student.most_recent_star_reading_percentile)}
                  {this.renderNumberCell(student.most_recent_mcas_ela_scaled)}
                  {this.renderNumberCell(student.most_recent_star_math_percentile)}
                  {this.renderNumberCell(student.most_recent_mcas_math_scaled)}
                  {this.renderNumberCell(this.renderCount(student.discipline_incidents_count))}
                  {this.renderNumberCell(this.renderCount(student.absences_count))}
                  {this.renderNumberCell(this.renderCount(student.tardies_count))}
                  {this.renderNumberCell(this.renderCount(student.active_services.length))}
                  <td>
                    {this.renderUnless('Reg Ed', student.program_assigned)}
                  </td>
                </tr>
              );
            }, this)}
          </tbody>
        </table>
      </div>
    );
  }

  renderNumberCell(children) {
    return (
      <td style={{textAlign: 'right', width: '5em', paddingRight: '3em'}}>
        {children}
      </td>
    );
  }

  renderUnless(ignoredValue, value) {
    const valueText = (value === null || value === undefined) ? 'None' : value;
    return (
      <span style={{opacity: (valueText === ignoredValue) ? 0.1 : 1 }}>
        {valueText}
      </span>
    );
  }

  renderCount(count) {
    return (count === 0) ? null : count;
  }

  renderHeader(caption, sortBy, sortType) {
    const pieces = caption.split(' ');

    return (
      <th onClick={this.onClickHeader.bind(null, sortBy, sortType)}
          className={this.headerClassName(sortBy)}>
        <div>{pieces[0]}</div>
        <div>{pieces[1]}</div>
      </th>
    );
  }
}
StudentsTable.propTypes = {
  students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  school: React.PropTypes.shape({
    local_id: React.PropTypes.string.isRequired,
    school_type: React.PropTypes.string.isRequired
  })
};

export default StudentsTable;