(function() {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;
  const Routes = window.shared.Routes;
  const RiskBubble = window.shared.RiskBubble;

  const styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20,
      display: 'flex'
    },
    nameTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      marginRight: 5
    },
    titleItem: {
      fontSize: 24,
      padding: 5
    },
    subtitleItem: {
      fontSize: 22,
      padding: 5
    }
  };

  /*
  This pure UI component renders top-line information like the student's name, school and
  classroom.
  */
  const StudentProfileHeader = window.shared.StudentProfileHeader = React.createClass({
    displayName: 'StudentProfileHeader',

    propTypes: {
      student: React.PropTypes.object.isRequired
    },

    render: function() {
      const student =  this.props.student;
      return (
        <div style={styles.titleContainer}>
          <div style={{ display: 'inline-block', flex: 'auto' }}>
            <a href={Routes.studentProfile(student.id)} style={styles.nameTitle}>
              {student.first_name + ' ' + student.last_name}
            </a>
            <div style={{ display: 'inline-block' }}>
              {this.bulletSpacer()}
              <a href={Routes.school(student.school_id)} style={styles.subtitleItem}>
                {student.school_name}
              </a>
              {this.bulletSpacer()}
              {this.homeroomOrEnrollmentStatus()}
              {this.bulletSpacer()}
              <span style={styles.subtitleItem}>
                {'Grade ' + student.grade}
              </span>
              {this.dateOfBirth()}
            </div>
          </div>
          <div
            style={{
              width: '15em',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
            <RiskBubble riskLevel={student.student_risk_level.level} />
          </div>
        </div>
      );
    },

    bulletSpacer: function() {
      return (
        <span style={styles.subtitleItem}>
          •
        </span>
      );
    },

    homeroomOrEnrollmentStatus: function() {
      const student =  this.props.student;
      if (student.enrollment_status === 'Active') {
        return (
          <a
            className="homeroom-link"
            href={Routes.homeroom(student.homeroom_id)}
            style={styles.subtitleItem}>
            {'Homeroom ' + student.homeroom_name}
          </a>
        );
      } else {
        return (
          <span style={styles.subtitleItem}>
            {student.enrollment_status}
          </span>
        );
      }
    },

    dateOfBirth: function () {
      const student =  this.props.student;
      const dateOfBirth = student.date_of_birth;
      if (!dateOfBirth) return null;

      const momentDOB = moment.utc(dateOfBirth);
      const ageInWords = ' (' + moment().diff(momentDOB, 'years') + ' years old)';

      return (
        <span>
          {this.bulletSpacer()}
          <span style={styles.subtitleItem}>
            {momentDOB.format('M/D/YYYY')}
            {ageInWords}
          </span>
        </span>
      );
    },

  });
})();
