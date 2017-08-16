import StudentRoster from '../components/student_roster.jsx';
import SectionHeader from './section_header.jsx';

$(function() {
  if ($('body').hasClass('sections') && $('body').hasClass('show')) {
    const MixpanelUtils = window.shared.MixpanelUtils;
    const SectionPage = window.shared.SectionPage;
    const Routes = window.shared.Routes;

    const serializedData = $('#serialized-data').data();
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'SECTION' });

    
    const styleStudentName = function(student, column) {
      return (
        <a href={Routes.studentProfile(student.id)}>
          {student.first_name + ' ' + student.last_name}
        </a>
      );
    };

    
    
    var columns = [
      {label: 'Name', key: 'first_name', cell:styleStudentName},
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


    window.ReactDOM.render(
      <div>
        <SectionHeader 
          section={serializedData.section}
          course={serializedData.course}
          educators={serializedData.educators}
          sections={serializedData.sections}
        />
        <StudentRoster
          students={serializedData.students}
          columns={columns}
          initialSort='first_name'
        />
      </div>, document.getElementById('main'));
  }
});