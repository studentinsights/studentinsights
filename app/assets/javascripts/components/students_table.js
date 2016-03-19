(function(root) {

  window.shared || (window.shared = {});
  var Filters = window.shared.Filters;
  var Routes = window.shared.Routes;
  var styles = window.shared.styles;
  var colors = window.shared.colors;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var StudentsTable = React.createClass({
    displayName: 'StudentsTable',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    componentDidMount: function() {
      new Tablesort(document.querySelector('.students-table'), { descending: false });
    },

    render: function() {
      return dom.div({ className: 'StudentsTable' },
        dom.table({ className: 'students-table', style: { width: '100%' } },
          dom.thead({},
            dom.tr({},
              this.renderHeader('Name', { className: 'sort-default' }), // className is read by Tablesort
              this.renderHeader('Grade'),
              this.renderHeader('Disability'),
              this.renderHeader('Low Income'),
              this.renderHeader('LEP'),
              this.renderHeader('STAR Reading'),
              this.renderHeader('MCAS ELA'),
              this.renderHeader('Star Math'),
              this.renderHeader('MCAS Math'),
              this.renderHeader('Discipline Incidents'),
              this.renderHeader('Absences'),
              this.renderHeader('Tardies'),
              this.renderHeader('Interventions'),
              this.renderHeader('Program'),
              this.renderHeader('Homeroom')
            )
          ),
          dom.tbody({},
            this.props.students.map(function(student) {
              return dom.tr({ key: student.id },
                dom.td({}, dom.a({ href: Routes.student(student.id) }, student.first_name + ' ' + student.last_name)),
                dom.td({}, student.grade),
                dom.td({}, this.renderUnless('None', student.sped_level_of_need)),
                dom.td({ style: { width: '2.5em' } }, this.renderUnless('Not Eligible', student.free_reduced_lunch)),
                dom.td({ style: { width: '2.5em' } }, this.renderUnless('Fluent', student.limited_english_proficiency)),
                this.renderNumberCell(student.most_recent_star_reading_percentile),
                this.renderNumberCell(student.most_recent_mcas_ela_scaled),
                this.renderNumberCell(student.most_recent_star_math_percentile),
                this.renderNumberCell(student.most_recent_mcas_math_scaled),
                this.renderNumberCell(this.renderCount(student.discipline_incidents_count)),
                this.renderNumberCell(this.renderCount(student.absences_count)),
                this.renderNumberCell(this.renderCount(student.tardies_count)),
                this.renderNumberCell(this.renderCount(student.interventions.length)),
                dom.td({}, this.renderUnless('Reg Ed', student.program_assigned)),
                dom.td({}, dom.a({ href: Routes.homeroom(student.homeroom_id) }, student.homeroom_name))
              );
            }, this)
          )
        )
      );
    },

    renderNumberCell: function(children) {
      return dom.td({ style: { textAlign: 'right', width: '5em', paddingRight: '3em' } }, children);
    },

    renderUnless: function(ignoredValue, value) {
      var valueText = (value === null || value === undefined) ? 'None' : value;
      return dom.span({ style: { opacity: (valueText === ignoredValue) ? 0.1 : 1 } }, valueText);
    },

    renderCount: function(count) {
      return (count === 0) ? null : count;
    },

    renderHeader: function(caption, options) {
      var className = (options && options.className) ? options.className : '';
      var pieces = caption.split(' ');
      return dom.th({ className: className }, pieces[0], dom.br(), pieces[1]);
    }
  });

  root.StudentsTable = StudentsTable;

})(window)
