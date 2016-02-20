(function() {
  window.shared || (window.shared = {});
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;
  var Routes = window.shared.Routes;

  var styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20
    },
    nameTitle: {
      fontSize: 30,
      fontWeight: 'bold'
    },
    titleItem: {
      fontSize: 25,
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
        dom.a({
          href: Routes.student(student.id),
          style: styles.nameTitle
        }, student.first_name + ' ' + student.last_name),
        dom.a({
          href: Routes.school(student.school_id),
          style: styles.titleItem
        }, '\n\u2022 ' + student.school_name + '\n\u2022'),
        dom.span({
          style: styles.titleItem
        }, 'Grade ' + student.grade + '\n\u2022'),
        dom.a({
          className: 'homeroom-link',
          href: Routes.homeroom(student.homeroom_id),
          style: styles.titleItem
        }, 'Homeroom ' + student.homeroom_name)
      );
    }
  });
})();
