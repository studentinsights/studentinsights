import FlexibleRoster from '../components/FlexibleRoster';
import SectionHeader from './SectionHeader';
import SortHelpers from '../helpers/sort_helpers.jsx';

(function(root) {
  window.shared || (window.shared = {});
  const Routes = window.shared.Routes;

  window.shared.SectionPage = React.createClass({
    displayName: 'SectionPage',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      sections: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      section: React.PropTypes.object.isRequired,
      currentEducator: React.PropTypes.object.isRequired
    },

    styleStudentName: function(student, column) {
      return (
        <a href={Routes.studentProfile(student.id)}>
          {student.last_name + ', ' + student.first_name}
        </a>
      );
    },

    nameSorter: function(a, b, sortBy) {
      const stringA = a['last_name'] + a['first_name'];
      const stringB = b['last_name'] + b['first_name'];

      return SortHelpers.baseSortByString(stringA, stringB);
    },

    programSorter: function(a, b, sortBy) {
      return SortHelpers.sortByCustomEnum(a,b,sortBy,['Reg Ed', '2Way English', '2Way Spanish', 'Sp Ed']);
    },

    languageProficiencySorter: function(a, b, sortBy) {
      return SortHelpers.sortByCustomEnum(a,b,sortBy,['FLEP-Transitioning', 'FLEP', 'Fluent']);
    },

    mcasPerformanceSorter: function(a, b, sortBy) {
      return SortHelpers.sortByCustomEnum(a,b,sortBy,['A','P','NI','W','F']);
    },

    render: function() {
      // Grades are being rolled out ONLY to educators with districtwide access
      // for data validation purposes
      const columns = [
        {label: 'Name', key: 'first_name', cell:this.styleStudentName, sortFunc: this.nameSorter},
        {label: 'Program Assigned', key: 'program_assigned', sortFunc: this.programSorter},

        // SPED & Disability
        {label: 'Disability', group: 'SPED & Disability', key: 'disability'},
        {label: '504 Plan', group: 'SPED & Disability', key: 'plan_504'},

        // Language
        {label: 'Fluency', group: 'Language', key: 'limited_english_proficiency', sortFunc: this.languageProficiencySorter},
        {label: 'Home Language', group: 'Language', key: 'home_language'},

        {label: 'Grade', key: 'grade_numeric', sortFunc: SortHelpers.sortByNumber},
        {label: 'Absences', key: 'most_recent_school_year_absences_count', sortFunc: SortHelpers.sortByNumber},
        {label: 'Tardies', key: 'most_recent_school_year_tardies_count', sortFunc: SortHelpers.sortByNumber},
        {label: 'Discipline Incidents', key: 'most_recent_school_year_discipline_incidents_count', sortFunc: SortHelpers.sortByNumber},

        // STAR: Math
        {label: 'Percentile', group: 'STAR: Math', key:'most_recent_star_math_percentile', sortFunc: SortHelpers.sortByNumber},

        // STAR: Reading
        {label: 'Percentile', group: 'STAR: Reading', key:'most_recent_star_reading_percentile', sortFunc: SortHelpers.sortByNumber},

        // MCAS: Math
        {label: 'Performance', group: 'MCAS: Math', key:'most_recent_mcas_math_performance', sortFunc: this.mcasPerformanceSorter},
        {label: 'Score', group: 'MCAS: Math', key:'most_recent_mcas_math_scaled', sortFunc: SortHelpers.sortByNumber},

        // MCAS: ELA
        {label: 'Performance', group: 'MCAS: ELA', key:'most_recent_mcas_ela_performance', sortFunc: this.mcasPerformanceSorter},
        {label: 'Score', group: 'MCAS: ELA', key:'most_recent_mcas_ela_scaled', sortFunc: SortHelpers.sortByNumber}
      ];

      return (
        <div className="section">
          <div className="header">
            <SectionHeader
              section={this.props.section}
              educators={this.props.educators}
              sections={this.props.sections}/>
          </div>
          <div className="roster">
            <FlexibleRoster
              rows={this.props.students}
              columns={columns}
              initialSortIndex={0}/>
          </div>
        </div>
      );
    }
  });
})(window);
