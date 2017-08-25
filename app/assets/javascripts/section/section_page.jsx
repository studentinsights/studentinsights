import Roster from '../components/roster.jsx';
import SectionHeader from './section_header.jsx';

(function(root) {
  window.shared || (window.shared = {});
  const MixpanelUtils = window.shared.MixpanelUtils;
  const styles = window.shared.styles;
  const Routes = window.shared.Routes;

  window.shared.SectionPage = React.createClass({
    displayName: 'SectionPage',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      educators: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      sections: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      section: React.PropTypes.object.isRequired
    },

    styleStudentName: function(student, column) {
      return (
        <a href={Routes.studentProfile(student.id)}>
          {student.first_name + ' ' + student.last_name}
        </a>
      );
    },

    render: function() {
      const columns = [
        {label: 'Name', key: 'first_name', cell:this.styleStudentName},
        {label: 'Program Assigned', key: 'program_assigned'},
        
        // SPED & Disability
        {label: 'Disability', group: 'SPED & Disability', key: 'disability'},
        {label: '504 Plan', group: 'SPED & Disability', key: 'plan_504'},
        
        // Language
        {label: 'Fluency', group: 'Language', key: 'limited_english_proficiency'},
        {label: 'Home Language', group: 'Language', key: 'home_language'},

        {label: 'Free / Reduced Lunch', key: 'free_reduced_lunch'},
        {label: 'Absences', key: 'most_recent_school_year_absences_count'},
        {label: 'Tardies', key: 'most_recent_school_year_tardies_count'},
        {label: 'Discipline Incidents', key: 'most_recent_school_year_discipline_incidents_count'},
        
        // STAR: Math
        {label: 'Percentile', group: 'STAR: Math', key:'most_recent_star_math_percentile'},

        // STAR: Reading
        {label: 'Percentile', group: 'STAR: Reading', key:'most_recent_star_reading_percentile'},
        
        // MCAS: Math
        {label: 'Performance', group: 'MCAS: Math', key:'most_recent_mcas_math_performance'},
        {label: 'Score', group: 'MCAS: Math', key:'most_recent_mcas_math_scaled'},
        
        // MCAS: ELA
        {label: 'Performance', group: 'MCAS: ELA', key:'most_recent_mcas_ela_performance'},
        {label: 'Score', group: 'MCAS: ELA', key:'most_recent_mcas_ela_scaled'}
      ];
      
      return (
        <div className="section" style={{ fontSize: styles.fontSize }}>
          <div className="header" style={styles.symmary}>
            <SectionHeader 
              section={this.props.section}
              educators={this.props.educators}
              sections={this.props.sections}/>
          </div>
          <div className="roster" style={{ padding: 20 }}>
            <Roster
              rows={this.props.students}
              columns={columns}
              initialSort='first_name'/>
          </div>
        </div>
      );
    }
  });
})(window);