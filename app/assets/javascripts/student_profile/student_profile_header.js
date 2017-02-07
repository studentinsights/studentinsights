(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var Routes = window.shared.Routes;
  var RiskBubble = window.shared.RiskBubble;

  var styles = {
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
  var StudentProfileHeader = window.shared.StudentProfileHeader = React.createClass({
    displayName: 'StudentProfileHeader',

    propTypes: {
      student: React.PropTypes.object.isRequired
    },

    render: function() {
      var student =  this.props.student;
      return dom.div({ style: styles.titleContainer },
        dom.div({ style: { display: 'inline-block', flex: 'auto' } },
          dom.a({
            href: Routes.studentProfile(student.id),
            style: styles.nameTitle
          }, student.first_name + ' ' + student.last_name),
          dom.div({ style: { display: 'inline-block' } },
            this.bulletSpacer(),
            dom.a({
              href: Routes.school(student.school_id),
              style: styles.subtitleItem
            }, student.school_name),
            this.bulletSpacer(),
            this.homeroomOrEnrollmentStatus(),
            this.bulletSpacer(),
            dom.span({
              style: styles.subtitleItem
            }, 'Grade ' + student.grade),
            this.bulletSpacer(),
            this.dateOfBirth()
          )
        ),
        dom.div({
          style: {
            width: '15em',
            display: 'flex',
            justifyContent: 'flex-end'
          },
        },
          createEl(RiskBubble, {
            riskLevel: student.student_risk_level.level
          })
        )
      );
    },

    bulletSpacer: function() {
      return dom.span({ style: styles.subtitleItem }, '•');
    },

    homeroomOrEnrollmentStatus: function() {
      var student =  this.props.student;
      if (student.enrollment_status === 'Active') {
        return dom.a({
          className: 'homeroom-link',
          href: Routes.homeroom(student.homeroom_id),
          style: styles.subtitleItem
        }, 'Homeroom ' + student.homeroom_name);
      } else {
        return dom.span({ style: styles.subtitleItem }, student.enrollment_status);
      }
    },

    dateOfBirth: function () {
      var student =  this.props.student;
      var momentDOB = moment.utc(student.date_of_birth);
      var ageInWords = ' (' + moment().diff(momentDOB, 'years') + ' years old)';

      return dom.span({ style: styles.subtitleItem },
        momentDOB.format('D/M/YYYY'), ageInWords
      );
    },

  });
})();
