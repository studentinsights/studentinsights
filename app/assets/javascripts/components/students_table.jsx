import _ from 'lodash';
import SortHelpers from '../helpers/sort_helpers.jsx';

window.shared || (window.shared = {});
const Routes = window.shared.Routes;
const merge = window.shared.ReactHelpers.merge;

export default React.createClass({
  displayName: 'StudentsTable',

  propTypes: {
    students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    school: React.PropTypes.object.isRequired
  },

  getInitialState () {
    return {
      sortBy: 'last_name',
      sortType: 'string',
      sortDesc: true
    };
  },

  mergeInDateOfLastSST (student) {
    const eventNotes = student.eventNotes;
    const sstNotes = eventNotes.filter((note) => {
      return note.eventNoteTypeId === 300; });

    if (sstNotes.length === 0) return merge(student, { dateOfLastSST: null });

    const sstNoteDates = sstNotes.map(note => moment.utc(note.recorded_at)).sort();
    const latestSstDate = _.last(sstNoteDates).format('M/D/YY');

    return merge(student, { dateOfLastSST: latestSstDate });
  },

  studentsWithDateOfLastSST () {
    return this.props.students.map(student => this.mergeInDateOfLastSST(student));
  },

  orderedStudents () {
    const sortedStudents = this.sortedStudents();

    if (!this.state.sortDesc) return sortedStudents.reverse();

    return sortedStudents;
  },

  sortedStudents () {
    const students = this.studentsWithDateOfLastSST();
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
    case 'freeReducedLunch':
      return students.sort((a, b) => SortHelpers.sortByString(a, b, sortBy));
    case 'grade':
      customEnum = ['PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'sped_level_of_need':
      customEnum = ['—', 'Low < 2', 'Low >= 2', 'Moderate', 'High'];
      return students.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, sortBy, customEnum));
    case 'limitedEnglishProficiency':
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
  },

  headerClassName (sortBy) {
    // Using tablesort classes here for the cute CSS carets,
    // not for the acutal table sorting JS (that logic is handled by this class).

    if (sortBy !== this.state.sortBy) return 'sort-header';

    if (this.state.sortDesc) return 'sort-header sort-down';

    return 'sort-header sort-up';
  },

  onClickHeader (sortBy, sortType) {
    if (sortBy === this.state.sortBy) {
      this.setState({ sortDesc: !this.state.sortDesc });
    } else {
      this.setState({ sortBy: sortBy, sortType: sortType });
    }
  },

  render () {
    const isHighSchool = 'HS'===this.props.school.school_type;

    return (
      <div className='StudentsTable'>
        <table className='students-table' style={{ width: '100%' }}>
          <thead>
            <tr>
              {this.renderHeader('Name', 'lastName', 'string')}
              {this.renderHeader('Last SST', 'dateOfLastSST', 'date')}
              {this.renderHeader('Grade', 'grade', 'grade')}
              {this.renderHeader('Disability', 'spedLevelOfNeed', 'spedLevelOfNeed')}
              {this.renderHeader('Low Income', 'freeReducedLunch', 'freeReducedLunch')}
              {this.renderHeader('LEP', 'limitedEnglishProficiency', 'limitedEnglishProficiency')}
              {this.renderHeader('STAR Reading', 'most_recent_star_reading_percentile', 'number')}
              {this.renderHeader('MCAS ELA', 'most_recent_mcas_ela_scaled', 'number')}
              {this.renderHeader('STAR Math', 'most_recent_star_math_percentile', 'number')}
              {this.renderHeader('MCAS Math', 'most_recent_mcas_math_scaled', 'number')}
              {this.renderHeader('Discipline Incidents', 'disciplineIncidentCount', 'number')}
              {this.renderHeader('Absences', 'absencesCount', 'number')}
              {this.renderHeader('Tardies', 'tardiesCount', 'number')}
              {this.renderHeader('Services', 'active_services', 'active_services')}
              {this.renderHeader('Program', 'program_assigned', 'program_assigned')}
              {this.renderHeader('Homeroom', 'homeroom_id', 'number')}
              {isHighSchool && this.renderHeader('House', 'house', 'string')}
              {isHighSchool && this.renderHeader('Counselor', 'counselor', 'string')}
            </tr>
          </thead>
          <tbody>
            {this.orderedStudents().map(student => {
              return (
                <tr key={student.id}>
                  <td>
                    <a href={Routes.studentProfile(student.id)}>
                      {student.lastName}, {student.firstName}
                    </a>
                  </td>
                  <td>{student.dateOfLastSST}</td>
                  <td>{student.grade}</td>
                  <td>{this.renderUnless('None', student.spedLevelOfNeed)}</td>
                  <td style={{width: '2.5em'}}>{this.renderUnless('Not Eligible', student.freeReducedLunch)}</td>
                  <td style={{width: '2.5em'}}>{this.renderUnless('Fluent', student.limitedEnglishProficiency)}</td>
                  {this.renderNumberCell(student.most_recent_star_reading_percentile)}
                  {this.renderNumberCell(student.most_recent_mcas_ela_scaled)}
                  {this.renderNumberCell(student.most_recent_star_math_percentile)}
                  {this.renderNumberCell(student.most_recent_mcas_math_scaled)}
                  {this.renderNumberCell(this.renderCount(student.disciplineIncidentsCount))}
                  {this.renderNumberCell(this.renderCount(student.absencesCount))}
                  {this.renderNumberCell(this.renderCount(student.tardiesCount))}
                  {this.renderNumberCell(this.renderCount(student.services.length))}
                  <td>
                    {this.renderUnless('Reg Ed', student.program_assigned)}
                  </td>
                  <td>
                    <a href={Routes.homeroom(student.homeroom_id)}>
                      {student.homeroom_name}
                    </a>
                  </td>
                  {isHighSchool && (<td>{student.house}</td>)}
                  {isHighSchool && (<td>{student.counselor}</td>)}
                </tr>
              );
            }, this)}
          </tbody>
        </table>
      </div>
    );
  },

  renderNumberCell (children) {
    return (
      <td style={{textAlign: 'right', width: '5em', paddingRight: '3em'}}>
        {children}
      </td>
    );
  },

  renderUnless (ignoredValue, value) {
    const valueText = (value === null || value === undefined) ? 'None' : value;
    return (
      <span style={{opacity: (valueText === ignoredValue) ? 0.1 : 1 }}>
        {valueText}
      </span>
    );
  },

  renderCount (count) {
    return (count === 0) ? null : count;
  },

  renderHeader (caption, sortBy, sortType) {
    const pieces = caption.split(' ');

    return (
      <th onClick={this.onClickHeader.bind(null, sortBy, sortType)}
          className={this.headerClassName(sortBy)}>
        {pieces[0]}
        <br/>
        {pieces[1]}
      </th>
    );
  }
});
