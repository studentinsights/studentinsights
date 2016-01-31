$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('overview')) {
    var Filters = window.shared.Filters;
    var Routes = window.shared.Routes;
    var SlicePanels = window.shared.SlicePanels;
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
                this.renderHeader('Grade'),
                this.renderHeader('Name'),
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
                  dom.td({}, student.grade),
                  dom.td({}, dom.a({ href: Routes.student(student.id) }, student.first_name + ' ' + student.last_name)),
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
                  dom.td({}, dom.a({ href: Routes.homeroom(student.homeroom_name) }, student.homeroom_name))
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

      renderHeader: function(caption) {
        // return dom.th({}, caption.split(' ').map(function(text) { return dom.div({}, text); }));
        var pieces = caption.split(' ');
        return dom.th({}, pieces[0], dom.br(), pieces[1]);
      }
    });

    // page
    var SchoolOverviewPage = React.createClass({
      displayName: 'SchoolOverviewPage',
      propTypes: {
        allStudents: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
        InterventionTypes: React.PropTypes.object.isRequired,
        initialFilters: React.PropTypes.arrayOf(React.PropTypes.object)
      },

      getInitialState: function() {
        return { filters: this.props.initialFilters };
      },

      componentDidMount: function() {
        $(document).on('keydown', this.onKeyDown);
        // window.onpopstate = this.onPopState;
      },

      componentWillUnmount: function() {
        $(document).off('keydown', this.onKeyDown);
      },

      // sink-only
      componentDidUpdate: function() {
        window.history.pushState({}, null, this.filtersHash());
      },

      filteredStudents: function() {
        return this.state.filters.reduce(function(filteredStudents, filter) {
          return filteredStudents.filter(filter.filterFn);
        }, this.props.allStudents);
      },

      clearFilters: function() {
        this.setState({ filters: [] });
      },

      onFilterToggled: function(toggledFilter) {
        var withoutToggledFilter = this.state.filters.filter(function(filter) {
          return filter.identifier !== toggledFilter.identifier;
        });
        var updatedFilters = (withoutToggledFilter.length === this.state.filters.length)
          ? this.state.filters.concat([toggledFilter])
          : withoutToggledFilter;
        this.setState({ filters: updatedFilters });
      },

      onResetClicked: function(e) {
        this.clearFilters();
      },

      onKeyDown: function(e) {
        if (e.keyCode === 27) this.clearFilters();
      },

      render: function() {
        return dom.div({
          className: 'school-overview',
          style: { fontSize: styles.fontSize }
        },
          dom.div({ className: 'header', style: styles.header }, createEl(SlicePanels, {
            allStudents: this.props.allStudents,
            students: this.filteredStudents(),
            InterventionTypes: this.props.InterventionTypes,
            filters: this.state.filters,
            onFilterToggled: this.onFilterToggled
          })),
          this.renderSummary(),
          dom.div({ className: 'list', style: { padding: 20 } },
            createEl(StudentsTable, {
              key: _.pluck(this.state.filters, 'identifier').join(','), // hack for tablesorter
              students: this.filteredStudents()
            })
          )
        );
      },

      renderSummary: function() {
        return dom.div({ className: 'summary', style: styles.summary },
          dom.div({ style: { backgroundColor: 'rgba(49, 119, 201, 0.75)', color: 'white', display: 'inline-block', width: '12em', padding: 5 } },
            'Found: ' + this.filteredStudents().length + ' students'
          ),
          dom.a({
            style: {
              marginLeft: 10,
              marginRight: 10,
              fontSize: styles.fontSize,
              display: 'inline-block',
              padding: 5,
              width: '10em',
              backgroundColor: (this.state.filters.length > 0) ? colors.selection : ''
            },
            onClick: this.onResetClicked
          }, (this.state.filters.length === 0) ? 'No filters' : 'Clear filters (ESC)'),
          dom.a({ href: this.filtersHash(), target: '_blank', style: { fontSize: styles.fontSize } }, 'Share this view'),
          this.renderDownloadLink()
          // debug only:
          // dom.span({}, this.state.filters.map(function(filter) {
          //   return dom.span({ key: filter.identifier }, filter.identifier);
          // })),
        );
      },

      renderDownloadLink: function() {
        var students = this.filteredStudents();
        var header = ['id', 'grade', 'first_name'];
        var rows = students.map(function(student) {
          return [student.id, student.grade, student.first_name].join(',');
        });
        var csvText = [header].concat(rows).join('\n');

        return dom.a({
          href: 'data:attachment/csv,' + encodeURIComponent(csvText),
          target: '_blank',
          download: 'student.csv',
          style: {
            paddingLeft: 20,
            fontSize: styles.fontSize
          }
        }, 'Download for Excel');
      },

      filtersHash: function() {
        return '#' + this.state.filters.map(function(filter) {
          return encodeURIComponent(filter.identifier);
        }).join('&');
      }
    });



    function main() {
      var serializedData = $('#serialized-data').data();

      // index by intervention type id
      var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
        map[interventionType.id] = interventionType;
        return map;
      }, {});

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        InterventionTypes: InterventionTypes,
        initialFilters: Filters.parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    main();
  }
});
