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
                  dom.td({}, dom.a({ href: Routes.homeroom(student.homeroom_id) }, student.homeroom_id))
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
      window.serializedData = serializedData;

      //TODO(kr) fix mismatch between dev/prod here
      serializedData.interventionTypes = [{"id":20,"name":"After-School Tutoring (ATP)","created_at":"2015-10-20T20:32:26.191Z","updated_at":"2015-10-20T20:32:26.191Z"},{"id":21,"name":"Attendance Officer","created_at":"2015-10-20T20:32:26.198Z","updated_at":"2015-10-20T20:32:26.198Z"},{"id":22,"name":"Attendance Contract","created_at":"2015-10-20T20:32:26.207Z","updated_at":"2015-10-20T20:32:26.207Z"},{"id":23,"name":"Behavior Contract","created_at":"2015-10-20T20:32:26.212Z","updated_at":"2015-10-20T20:32:26.212Z"},{"id":24,"name":"Behavior Plan","created_at":"2015-10-20T20:32:26.219Z","updated_at":"2015-10-20T20:32:26.219Z"},{"id":25,"name":"Boys \u0026 Girls Club","created_at":"2015-10-20T20:32:26.225Z","updated_at":"2015-10-20T20:32:26.225Z"},{"id":26,"name":"Classroom Academic Intervention","created_at":"2015-10-20T20:32:26.229Z","updated_at":"2015-10-20T20:32:26.229Z"},{"id":27,"name":"Classroom Behavior Intervention","created_at":"2015-10-20T20:32:26.234Z","updated_at":"2015-10-20T20:32:26.234Z"},{"id":28,"name":"Community Schools","created_at":"2015-10-20T20:32:26.241Z","updated_at":"2015-10-20T20:32:26.241Z"},{"id":29,"name":"Counseling: In-House","created_at":"2015-10-20T20:32:26.246Z","updated_at":"2015-10-20T20:32:26.246Z"},{"id":30,"name":"Counseling: Outside/Physician Referral","created_at":"2015-10-20T20:32:26.254Z","updated_at":"2015-10-20T20:32:26.254Z"},{"id":31,"name":"ER Referral (Mental Health)","created_at":"2015-10-20T20:32:26.265Z","updated_at":"2015-10-20T20:32:26.265Z"},{"id":32,"name":"Math Tutor","created_at":"2015-10-20T20:32:26.270Z","updated_at":"2015-10-20T20:32:26.270Z"},{"id":33,"name":"Mobile Crisis Referral","created_at":"2015-10-20T20:32:26.284Z","updated_at":"2015-10-20T20:32:26.284Z"},{"id":34,"name":"MTSS Referral","created_at":"2015-10-20T20:32:26.293Z","updated_at":"2015-10-20T20:32:26.293Z"},{"id":35,"name":"OT/PT Consult","created_at":"2015-10-20T20:32:26.297Z","updated_at":"2015-10-20T20:32:26.297Z"},{"id":36,"name":"Parent Communication","created_at":"2015-10-20T20:32:26.309Z","updated_at":"2015-10-20T20:32:26.309Z"},{"id":37,"name":"Parent Conference/Meeting","created_at":"2015-10-20T20:32:26.320Z","updated_at":"2015-10-20T20:32:26.320Z"},{"id":39,"name":"Peer Mediation","created_at":"2015-10-20T20:32:26.342Z","updated_at":"2015-10-20T20:32:26.342Z"},{"id":40,"name":"Reading Specialist","created_at":"2015-10-20T20:32:26.364Z","updated_at":"2015-10-20T20:32:26.364Z"},{"id":41,"name":"Reading Tutor","created_at":"2015-10-20T20:32:26.375Z","updated_at":"2015-10-20T20:32:26.375Z"},{"id":42,"name":"SST Referral","created_at":"2015-10-20T20:32:26.379Z","updated_at":"2015-10-20T20:32:26.379Z"},{"id":43,"name":"Weekly Call/Email Home","created_at":"2015-10-20T20:32:26.389Z","updated_at":"2015-10-20T20:32:26.389Z"},{"id":44,"name":"X Block Tutor","created_at":"2015-10-20T20:32:26.393Z","updated_at":"2015-10-20T20:32:26.393Z"},{"id":45,"name":"51a Filing","created_at":"2015-10-20T20:32:26.399Z","updated_at":"2015-10-20T20:32:26.399Z"},{"id":46,"name":"Other","created_at":"2015-10-20T20:32:26.405Z","updated_at":"2015-10-20T20:32:26.405Z"}];

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
