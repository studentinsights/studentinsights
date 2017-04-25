(function(root) {

  window.shared || (window.shared = {});
  const Filters = window.shared.Filters;
  const Routes = window.shared.Routes;
  const styles = window.shared.styles;
  const colors = window.shared.colors;
  const merge = window.shared.ReactHelpers.merge;

  const StudentsTable = React.createClass({
    displayName: 'StudentsTable',

    propTypes: {
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired
    },

    componentDidMount: function() {
      new Tablesort(document.querySelector('.students-table'), { descending: false });
    },

    render: function() {
      return React.createElement("div", { className: 'StudentsTable' },
        React.createElement("table", { className: 'students-table', style: { width: '100%' } },
          React.createElement("thead", {},
            React.createElement("tr", {},
              this.renderHeader('Name', { className: 'sort-default' }), // className is read by Tablesort
              this.renderHeader('Grade'),
              this.renderHeader('Disability', { 'data-sort-method': "disability" }),
              this.renderHeader('Low Income'),
              this.renderHeader('LEP'),
              this.renderHeader('STAR Reading'),
              this.renderHeader('MCAS ELA'),
              this.renderHeader('STAR Math'),
              this.renderHeader('MCAS Math'),
              this.renderHeader('Discipline Incidents'),
              this.renderHeader('Absences'),
              this.renderHeader('Tardies'),
              this.renderHeader('Services'),
              this.renderHeader('Program', { 'data-sort-method': 'prog_assign_sort' }),
              this.renderHeader('Homeroom')
            )
          ),
          React.createElement("tbody", {},
            this.props.students.map(function(student) {
              return React.createElement("tr", { key: student.id },
                React.createElement("td", {}, React.createElement("a", { href: Routes.studentProfile(student.id) }, student.first_name + ' ' + student.last_name)),
                React.createElement("td", {}, student.grade),
                React.createElement("td", {}, this.renderUnless('None', student.sped_level_of_need)),
                React.createElement("td", { style: { width: '2.5em' } }, this.renderUnless('Not Eligible', student.free_reduced_lunch)),
                React.createElement("td", { style: { width: '2.5em' } }, this.renderUnless('Fluent', student.limited_english_proficiency)),
                this.renderNumberCell(student.most_recent_star_reading_percentile),
                this.renderNumberCell(student.most_recent_mcas_ela_scaled),
                this.renderNumberCell(student.most_recent_star_math_percentile),
                this.renderNumberCell(student.most_recent_mcas_math_scaled),
                this.renderNumberCell(this.renderCount(student.discipline_incidents_count)),
                this.renderNumberCell(this.renderCount(student.absences_count)),
                this.renderNumberCell(this.renderCount(student.tardies_count)),
                this.renderNumberCell(this.renderCount(student.active_services.length)),
                React.createElement("td", {}, this.renderUnless('Reg Ed', student.program_assigned)),
                React.createElement("td", {}, React.createElement("a", { href: Routes.homeroom(student.homeroom_id) }, student.homeroom_name))
              );
            }, this)
          )
        )
      );
    },

    renderNumberCell: function(children) {
      return React.createElement("td", { style: { textAlign: 'right', width: '5em', paddingRight: '3em' } }, children);
    },

    renderUnless: function(ignoredValue, value) {
      const valueText = (value === null || value === undefined) ? 'None' : value;
      return React.createElement("span", { style: { opacity: (valueText === ignoredValue) ? 0.1 : 1 } }, valueText);
    },

    renderCount: function(count) {
      return (count === 0) ? null : count;
    },

    renderHeader: function(caption, options) {
      const pieces = caption.split(' ');
      return React.createElement("th", options || {}, pieces[0], React.createElement("br", ), pieces[1]);
    }
  });

  root.StudentsTable = StudentsTable;

})(window)
