$(function() {

  if ($('body').hasClass('schools') && $('body').hasClass('show')) {

    var dom = ReactHelpers.dom;
    var createEl = ReactHelpers.createEl;
    var merge = ReactHelpers.merge;

    function calculateYearsEnrolled (registration_date) {
      if (registration_date === null) return null;
      return Math.floor((new Date() - new Date(registration_date)) / (1000 * 60 * 60 * 24 * 365));
    };

    // Define filter operations
    var Filters = {
      Range: function(key, range) {
        return {
          identifier: ['range', key, range[0], range[1]].join(':'),
          filterFn: function(student) {
            var value = student[key];
            return (_.isNumber(value) && value >= range[0] && value < range[1]);
          }
        };
      },
      // Types are loose, since this is serialized from the hash
      Equal: function(key, value) {
        return {
          identifier: ['equal', key, value].join(':'),
          filterFn: function(student) {
            return (student[key] == value);
          }
        };
      },
      Null: function(key) {
        return {
          identifier: ['null', key].join(':'),
          filterFn: function(student) {
            var value = student[key];
            return (value === null || value === undefined) ? true : false;
          }
        };
      },
      InterventionType: function(interventionTypeId) {
        return {
          identifier: ['intervention_type', interventionTypeId].join(':'),
          filterFn: function(student) {
            if (interventionTypeId === null) return (student.interventions.length === 0);
            return student.interventions.filter(function(intervention) {
              return intervention.intervention_type_id === interventionTypeId;
            }).length > 0;
          }
        };
      },
      YearsEnrolled: function(value) {
        return {
          identifier: ['years_enrolled', value].join(':'),
          filterFn: function(student) {
            return (calculateYearsEnrolled(student.registration_date) === value);
          }
        };
      },

      // Has to parse from string back to numeric
      createFromIdentifier: function(identifier) {
        var parts = identifier.split(':');
        if (parts[0] === 'range') return Filters.Range(parts[1], [parseFloat(parts[2]), parseFloat(parts[3])]);
        if (parts[0] === 'null') return Filters.Null(parts[1]);
        if (parts[0] === 'equal') return Filters.Equal(parts[1], parts[2]);
        if (parts[0] === 'intervention_type') return Filters.InterventionType(parts[1]);
        if (parts[0] === 'years_enrolled') return Filters.YearsEnrolled(parseFloat(parts[1]));
        return null;
      }
    };



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
                this.renderHeader('Name'),
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
                  this.renderNumberCell(this.renderCount(student.absences_count_most_recent_school_year)),
                  this.renderNumberCell(this.renderCount(student.tardies_count_most_recent_school_year)),
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

      renderHeader: function(caption) {
        // return dom.th({}, caption.split(' ').map(function(text) { return dom.div({}, text); }));
        var pieces = caption.split(' ');
        return dom.th({}, pieces[0], dom.br(), pieces[1]);
      }
    });

    // fixed items, already sorted, no collapsing
    var FixedTable = React.createClass({
      displayName: 'FixedTable',

      onRowClicked: function(item, e) {
        this.props.onFilterToggled(item.filter);
      },

      render: function() {
        return this.renderTableFor(
          this.props.title,
          this.props.belowTitleOption,
          this.props.items,
          this.props
        );
      },

      // title height is fixed since font-weight causes loading a font which delays initial render
      renderTableFor: function(title, belowTitleOption, items, options) {
        options || (options = {});
        var className = options.className || '';
        var selectedFilterIdentifiers = _.pluck(this.props.filters, 'identifier');
        return dom.div({
          className: 'FixedTable panel ' + className,
          style: {
            display: 'inline-block',
            paddingTop: 5,
            paddingBottom: 5
          }
        },
          dom.div({ className: 'FixedTable',
                    style: { marginBottom: 5,
                             paddingLeft: 5,
                             fontWeight: 'bold',
                             height: '1em' }
                  }, title),
          belowTitleOption,
          dom.table({},
            dom.tbody({}, items.map(function(item) {
              var key = item.caption;
              var isFilterApplied = _.contains(selectedFilterIdentifiers, item.filter.identifier);
              return dom.tr({
                key: item.caption,
                style: {
                  backgroundColor: (isFilterApplied) ? colors.selection: null,
                  cursor: 'pointer'
                },
                onClick: this.onRowClicked.bind(this, item)
              },
                dom.td({
                  className: 'caption-cell',
                  style: { opacity: (item.percentage === 0) ? 0.15 : 1 }
                },
                  dom.a({
                    style: { fontSize: styles.fontSize, paddingLeft: 10 }
                  }, item.caption)
                ),
                dom.td({ style: { fontSize: styles.fontSize, width: 48, textAlign: 'right', paddingRight: 8 }},
                  (item.percentage ===  0) ? '' : Math.ceil(100 * item.percentage) + '%'),
                dom.td({ style: { fontSize: styles.fontSize, width: 50 } }, this.renderBar(item.percentage, 50))
              );
            }, this))
          ),
          dom.div({ style: { paddingLeft: 5 } }, this.props.children)
        );
      },

      renderBar: function(percentage, width) {
        return dom.div({
          className: 'bar',
          style: {
            width: Math.round(width*percentage) + '%',
            height: '1em',
          }
        });
      }
    });


    // table that supports collapsing
    var CollapsableTable = React.createClass({
      displayName: 'CollapsableTable',
      getDefaultProps: function() {
        return {
          minHeight: 132,
          limit: 5,
          className: ''
        };
      },

      getInitialState: function() {
        return {
          isExpanded: false
        };
      },

      onCollapseClicked: function(e) {
        this.setState({ isExpanded: false });
      },

      onExpandClicked: function(e) {
        this.setState({ isExpanded: true });
      },

      render: function() {
        var truncatedItems = (this.state.isExpanded)
          ? this.props.items
          : this.props.items.slice(0, this.props.limit);
        return dom.div({ className: 'CollapsableTable' },
          createEl(FixedTable, merge(this.props, {
            items: truncatedItems,
            belowTitleOption: this.renderCollapseOrExpand()
          }))
        );
      },

      renderCollapseOrExpand: function() {
        if (this.props.items.length <= this.props.limit) return;
        return dom.a({
          style: {
            fontSize: styles.fontSize,
            color: '#999',
            paddingTop: 5,
            paddingBottom: 5,
            display: 'block'
          },
          onClick: (this.state.isExpanded) ? this.onCollapseClicked : this.onExpandClicked
        }, (this.state.isExpanded) ? '- Hide details' : '+ Show all');

      }
    });



    // colors, styles
    var colors = {
      selection: 'rgb(255, 204, 138)'
    };

    var styles = {
      fontSize: 12,

      header: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        backgroundColor: '#eee'
      },

      columnsContainer: {
        display: 'flex',
        flexDirection: 'row'
      },

      summary: {
        marginTop: 0,
        borderTop: '1px solid #ccc',
        background: 'white',
        paddingTop: 5,
        paddingLeft: 30,
        paddingBottom: 20
      }
    };


    // page
    var SchoolOverviewPage = React.createClass({
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
          dom.div({ className: 'header', style: styles.header },
            dom.div({ className: 'columns-container', style: styles.columnsContainer },
              this.renderProfileColumn(),
              this.renderGradeColumn(),
              this.renderELAColumn(),
              this.renderMathColumn(),
              this.renderAttendanceColumn(),
              this.renderInterventionsColumn()
            )
          ),
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
        var header = [
          'First Name',
          'Last Name',
          'Grade',
          'SPED Level of Need',
          'Free/Reduced Lunch',
          'Limited English Proficient',
          'STAR Reading Percentile',
          'MCAS ELA Score',
          'MCAS ELA Growth',
          'STAR Math Percentile',
          'MCAS Math Score',
          'MCAS Math Growth',
          'Discipline Incidents',
          'Absences This Year',
          'Tardies This Year',
          'Intervention Count',
          'Program Assigned',
          'Homeroom Name',
        ];
        var rows = students.map(function(student) {
          return [
            student.first_name,
            student.last_name,
            student.grade,
            student.sped_level_of_need,
            student.free_reduced_lunch,
            student.limited_english_proficiency,
            student.most_recent_star_reading_percentile,
            student.most_recent_mcas_ela_scaled,
            student.most_recent_mcas_ela_growth,
            student.most_recent_star_math_percentile,
            student.most_recent_mcas_math_scaled,
            student.most_recent_mcas_math_growth,
            student.discipline_incidents_count,
            student.absences_count_most_recent_school_year,
            student.tardies_count_most_recent_school_year,
            student.interventions.length,
            student.program_assigned,
            student.homeroom_name,
          ].join(',');
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
      },

      renderProfileColumn: function() {
        return dom.div({ className: 'column' },
          this.renderDisabilityTable(),
          this.renderSimpleTable('Low Income', 'free_reduced_lunch', { limit: 4 }),
          this.renderSimpleTable('LEP', 'limited_english_proficiency', { limit: 3 })
        );
      },

      renderDisabilityTable: function() {
        var key = 'sped_level_of_need';
        var items = ['Low < 2', 'Low >= 2', 'Moderate', 'High'].map(function(value) {
          return this.createItem(value, Filters.Equal(key, value));
        }, this);
        return this.renderTable({
          title: 'Disability',
          items: [this.createItem('None', Filters.Null(key))].concat(items)
        });
      },

      renderELAColumn: function() {
        return dom.div({ className: 'column ela-background' },
          this.renderPercentileTable('STAR Reading', 'most_recent_star_reading_percentile'),
          this.renderMCASTable('MCAS ELA', 'most_recent_mcas_ela_scaled'),
          this.renderPercentileTable('Growth - MCAS ELA', 'most_recent_mcas_ela_growth')
        );
      },

      renderMathColumn: function() {
        return dom.div({ className: 'column math-background' },
          this.renderPercentileTable('STAR Math', 'most_recent_star_math_percentile'),
          this.renderMCASTable('MCAS Math', 'most_recent_mcas_math_scaled'),
          this.renderPercentileTable('Growth - MCAS Math', 'most_recent_mcas_math_growth')
        );
      },

      renderPercentileTable: function(title, key, props) {
        return this.renderTable(merge(props || {}, {
          title: title,
          items: [this.createItem('None', Filters.Null(key))].concat([
            this.createItem('< 25th', Filters.Range(key, [0, 25])),
            this.createItem('25th - 50th', Filters.Range(key, [25, 50])),
            this.createItem('50th - 75th', Filters.Range(key, [50, 75])),
            this.createItem('> 75th', Filters.Range(key, [75, 100]))
          ])
        }));
      },

      renderMCASTable: function(title, key, props) {
        return this.renderTable(merge(props || {}, {
          title: title,
          items: [this.createItem('None', Filters.Null(key))].concat([
            this.createItem('Warning', Filters.Range(key, [200, 220])),
            this.createItem('Needs Improvement', Filters.Range(key, [220, 240])),
            this.createItem('Proficient', Filters.Range(key, [240, 260])),
            this.createItem('Advanced', Filters.Range(key, [260, 281]))
          ])
        }));
      },

      renderAttendanceColumn: function() {
        return dom.div({ className: 'column attendance-column attendance-background pad-column-right' },
          this.renderDisciplineTable(),
          this.renderAttendanceTable('Absences', 'absences_count_most_recent_school_year'),
          this.renderAttendanceTable('Tardies', 'tardies_count_most_recent_school_year')
        );
      },

      renderDisciplineTable: function() {
        var key = 'discipline_incidents_count';
        return this.renderTable({
          title: 'Discipline incidents',
          items: [
            this.createItem('0', Filters.Equal(key, 0)),
            this.createItem('1', Filters.Equal(key, 1)),
            this.createItem('2', Filters.Equal(key, 2)),
            this.createItem('3 - 5', Filters.Range(key, [3, 6])),
            // this.createItem('6+', Filters.Range(key, [5, 7])),
            this.createItem('6+', Filters.Range(key, [6, Number.MAX_VALUE]))
          ]
        });
      },

      renderAttendanceTable: function(title, key) {
        return this.renderTable({
          title: title,
          items: [
            this.createItem('0 days', Filters.Equal(key, 0)),
            this.createItem('< 1 week', Filters.Range(key, [1, 5])),
            this.createItem('1 - 2 weeks', Filters.Range(key, [5, 10])),
            this.createItem('2 - 4 weeks', Filters.Range(key, [10, 21])),
            this.createItem('> 4 weeks', Filters.Range(key, [21, Number.MAX_VALUE]))
          ]
        });
      },

      renderInterventionsColumn: function() {
        return dom.div({ className: 'column interventions-column' },
          this.renderTable({
            title: 'Interventions',
            items: this.interventionItems(),
            limit: 5
          }),
          this.renderSimpleTable('Program', 'program_assigned', { limit: 3 }),
          this.renderSimpleTable('Homeroom', 'homeroom_name', { limit: 3 })
        );
      },

      createItem: function(caption, filter) {
        var students = this.filteredStudents();
        return {
          caption: caption,
          percentage: (students.length === 0) ? 0 : students.filter(filter.filterFn).length / students.length,
          filter: filter
        };
      },

      interventionItems: function() {
        var students = this.props.allStudents;
        var allInterventions = _.flatten(_.pluck(students, 'interventions'));
        var allInterventionTypes = _.unique(allInterventions.map(function(intervention) {
          return parseInt(intervention.intervention_type_id, 10);
        }));
        var interventionItems = allInterventionTypes.map(function(interventionTypeId) {
          var interventionName = this.props.InterventionTypes[interventionTypeId].name;
          return this.createItem(interventionName, Filters.InterventionType(interventionTypeId));
        }, this);
        var sortedItems =  _.sortBy(interventionItems, function(item) {
          return -1 * students.filter(item.filter.filterFn).length;
        });

        return sortedItems.concat(this.createItem('None', Filters.InterventionType(null)));
      },

      renderGradeTable: function() {
        var key = 'grade';
        var uniqueValues = _.compact(_.unique(_.pluck(this.props.allStudents, key)));
        var items = uniqueValues.map(function(value) {
          return this.createItem(value, Filters.Equal(key, value));
        }, this);
        var sortedItems = _.sortBy(items, function(item) {
          if (item.caption === 'PK') return -20;
          if (item.caption === 'KF') return -10;
          return parseFloat(item.caption);
        });

        return this.renderTable({
          title: 'Grade',
          items: sortedItems,
          limit: 10
        });
      },

      renderGradeColumn: function() {
        return dom.div({ className: 'column grades-column pad-column-right' },
          this.renderGradeTable(),
          this.renderYearsEnrolled()
        );
      },

      renderYearsEnrolled: function() {
        var uniqueValues = _.compact(_.unique(this.props.allStudents.map(function(student) {
          return calculateYearsEnrolled(student.registration_date)
        })));
        var items = uniqueValues.map(function(value) {
          return this.createItem(value, Filters.YearsEnrolled(value));
        }, this);
        var sortedItems = _.sortBy(items, function(item) { return parseFloat(item.caption); });

        return this.renderTable({
          title: 'Years enrolled',
          items: sortedItems,
          limit: 5
        });
      },

      createItemsFromValues: function(key, uniqueValues) {
        var items = _.compact(uniqueValues).map(function(value) {
          return this.createItem(value, Filters.Equal(key, value));
        }, this);
        var itemsWithNull = (_.any(uniqueValues, _.isNull))
          ? items.concat(this.createItem('None', Filters.Null(key)))
          : items;
        var students = this.props.allStudents;
        return _.sortBy(itemsWithNull, function(item) {
          return -1 * students.filter(item.filter.filterFn).length;
        });
      },


      renderSimpleTable: function(title, key, props) {
        var uniqueValues = _.unique(_.pluck(this.props.allStudents, key));
        var items = this.createItemsFromValues(key, uniqueValues);
        return this.renderTable(merge(props || {}, {
          title: title,
          items: items
        }));
      },

      renderTable: function(props) {
        return createEl(CollapsableTable, merge(props, {
          filters: this.state.filters,
          onFilterToggled: this.onFilterToggled
        }));
      }
    });



    function main() {
      var serializedData = $('#serialized-data').data();
      window.serializedData = serializedData;

      // index by intervention type id
      var InterventionTypes = serializedData.interventionTypes.reduce(function(map, interventionType) {
        map[interventionType.id] = interventionType;
        return map;
      }, {});

      ReactDOM.render(createEl(SchoolOverviewPage, {
        allStudents: serializedData.students,
        InterventionTypes: InterventionTypes,
        initialFilters: parseFiltersHash(window.location.hash)
      }), document.getElementById('main'));
    }

    // Returns a list of Filters
    function parseFiltersHash(hash) {
      var pieces = _.compact(hash.slice(1).split('&'));
      return _.compact(pieces.map(function(piece) {
        return Filters.createFromIdentifier(window.decodeURIComponent(piece));
      }));
    };

    main();
  }
});
