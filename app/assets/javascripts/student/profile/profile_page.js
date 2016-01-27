$(function() {
  // only run if the correct page
  if (!($('body').hasClass('students') && $('body').hasClass('profile'))) return;

  // imports
  var Routes = window.shared.Routes;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  // define page component
  var styles = {
    titleContainer: {
      fontSize: 16,
      padding: 20
    },
    nameTitle: {
      fontSize: 20,
      fontWeight: 'bold'
    },
    titleItem: {
      padding: 5
    },
    summaryContainer: {
      display: 'flex',
      flexDirection: 'row',
      background: '#eee'
    }
  };

  var StudentProfilePage = React.createClass({
    displayName: 'StudentProfilePage',

    propTypes: {
      student: React.PropTypes.object.isRequired
    },

    getInitialState: function() {
      return {
        selectedSectionKey: 'notes'
      };
    },

    render: function() {
      return dom.div({ className: 'StudentProfilePage' },
        this.renderStudentName(),
        dom.div({ style: styles.summaryContainer },
          this.renderDemographics(),
          dom.div({ className: 'math-background', style: { flex: 1 }}, 'math'),
          dom.div({ className: 'ela-background', style: { flex: 1 }}, 'ela'),
          dom.div({ style: { flex: 1 }}, 'behavior'),
          dom.div({ style: { flex: 1 }}, 'interventions')
        )
      );
    },

    renderStudentName: function() {
      var student =  this.props.student;
      return dom.div({ style: styles.titleContainer },
        dom.a({
          href: Routes.student(student.id),
          style: styles.nameTitle
        }, student.first_name + ' ' + student.last_name),
        dom.a({
          href: Routes.school(student.school_id),
          style: styles.titleItem
        }, student.school_name),
        dom.span({
          style: styles.titleItem
        }, student.grade),
        dom.a({
          href: Routes.homeroom(student.homeroom_id),
          style: styles.titleItem
        }, student.homeroom_name)
      );
    },

    renderDemographics: function() {
      return dom.div({ style: { flex: 1 }},
        this.renderTitle('Demographics')
      );
    },

    renderTitle: function(text) {
      return dom.div({}, text);
    }
  });

  // entry point
  function main() {
    var serializedData = $('#serialized-data').data();
    window.serializedData = serializedData;

    //TODO(kr) fix mismatch between dev/prod here
    // serializedData.interventionTypes = [{"id":20,"name":"After-School Tutoring (ATP)","created_at":"2015-10-20T20:32:26.191Z","updated_at":"2015-10-20T20:32:26.191Z"},{"id":21,"name":"Attendance Officer","created_at":"2015-10-20T20:32:26.198Z","updated_at":"2015-10-20T20:32:26.198Z"},{"id":22,"name":"Attendance Contract","created_at":"2015-10-20T20:32:26.207Z","updated_at":"2015-10-20T20:32:26.207Z"},{"id":23,"name":"Behavior Contract","created_at":"2015-10-20T20:32:26.212Z","updated_at":"2015-10-20T20:32:26.212Z"},{"id":24,"name":"Behavior Plan","created_at":"2015-10-20T20:32:26.219Z","updated_at":"2015-10-20T20:32:26.219Z"},{"id":25,"name":"Boys \u0026 Girls Club","created_at":"2015-10-20T20:32:26.225Z","updated_at":"2015-10-20T20:32:26.225Z"},{"id":26,"name":"Classroom Academic Intervention","created_at":"2015-10-20T20:32:26.229Z","updated_at":"2015-10-20T20:32:26.229Z"},{"id":27,"name":"Classroom Behavior Intervention","created_at":"2015-10-20T20:32:26.234Z","updated_at":"2015-10-20T20:32:26.234Z"},{"id":28,"name":"Community Schools","created_at":"2015-10-20T20:32:26.241Z","updated_at":"2015-10-20T20:32:26.241Z"},{"id":29,"name":"Counseling: In-House","created_at":"2015-10-20T20:32:26.246Z","updated_at":"2015-10-20T20:32:26.246Z"},{"id":30,"name":"Counseling: Outside/Physician Referral","created_at":"2015-10-20T20:32:26.254Z","updated_at":"2015-10-20T20:32:26.254Z"},{"id":31,"name":"ER Referral (Mental Health)","created_at":"2015-10-20T20:32:26.265Z","updated_at":"2015-10-20T20:32:26.265Z"},{"id":32,"name":"Math Tutor","created_at":"2015-10-20T20:32:26.270Z","updated_at":"2015-10-20T20:32:26.270Z"},{"id":33,"name":"Mobile Crisis Referral","created_at":"2015-10-20T20:32:26.284Z","updated_at":"2015-10-20T20:32:26.284Z"},{"id":34,"name":"MTSS Referral","created_at":"2015-10-20T20:32:26.293Z","updated_at":"2015-10-20T20:32:26.293Z"},{"id":35,"name":"OT/PT Consult","created_at":"2015-10-20T20:32:26.297Z","updated_at":"2015-10-20T20:32:26.297Z"},{"id":36,"name":"Parent Communication","created_at":"2015-10-20T20:32:26.309Z","updated_at":"2015-10-20T20:32:26.309Z"},{"id":37,"name":"Parent Conference/Meeting","created_at":"2015-10-20T20:32:26.320Z","updated_at":"2015-10-20T20:32:26.320Z"},{"id":39,"name":"Peer Mediation","created_at":"2015-10-20T20:32:26.342Z","updated_at":"2015-10-20T20:32:26.342Z"},{"id":40,"name":"Reading Specialist","created_at":"2015-10-20T20:32:26.364Z","updated_at":"2015-10-20T20:32:26.364Z"},{"id":41,"name":"Reading Tutor","created_at":"2015-10-20T20:32:26.375Z","updated_at":"2015-10-20T20:32:26.375Z"},{"id":42,"name":"SST Referral","created_at":"2015-10-20T20:32:26.379Z","updated_at":"2015-10-20T20:32:26.379Z"},{"id":43,"name":"Weekly Call/Email Home","created_at":"2015-10-20T20:32:26.389Z","updated_at":"2015-10-20T20:32:26.389Z"},{"id":44,"name":"X Block Tutor","created_at":"2015-10-20T20:32:26.393Z","updated_at":"2015-10-20T20:32:26.393Z"},{"id":45,"name":"51a Filing","created_at":"2015-10-20T20:32:26.399Z","updated_at":"2015-10-20T20:32:26.399Z"},{"id":46,"name":"Other","created_at":"2015-10-20T20:32:26.405Z","updated_at":"2015-10-20T20:32:26.405Z"}];

    // index by intervention type id
    // var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
    //   map[interventionType.id] = interventionType;
    //   return map;
    // }, {});

    ReactDOM.render(createEl(StudentProfilePage, {
      student: serializedData.student
    }), document.getElementById('main'));
  }

  main();
});
