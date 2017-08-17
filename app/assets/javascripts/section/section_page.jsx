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
        {label: 'Disability', key: 'disability'},
        {label: '504 Plan', key: 'plan_504'},
        {label: 'Fluency', key: 'limited_english_proficiency'},
        {label: 'Home Language', key: 'home_language'},
        {label: 'Free / Reduced Lunch', key: 'free_reduced_lunch'},
        {label: 'Absences', key: 'most_recent_school_year_absences_count'},
        {label: 'Tardies', key: 'most_recent_school_year_tardies_count'},
        {label: 'Discipline Incidents', key: 'most_recent_school_year_discipline_incidents_count'},
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