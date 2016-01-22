(function(root) {

  var dom = ReactHelpers.dom;
  var createEl = ReactHelpers.createEl;
  var merge = ReactHelpers.merge;

  function calculateYearsEnrolled (registration_date) {
    if (registration_date === null) return null;
    return Math.floor((new Date() - new Date(registration_date)) / (1000 * 60 * 60 * 24 * 365));
  };

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

    filterKey: function (filter) {
      return filter.key;
    },

    activeFiltersByCategory: function () {
      // Group by active filters by category.
      // Returns an array of arrays; each inner array is a group of filters with the same category.

      return _.values(_.groupBy(this.state.filters, this.filterKey));
    },

    filterWithOr: function (filterGroups) {
      // Expects an array of arrays as input; each inner array is a group of filters to be reduced with OR logic.
      //
      // Outputs another array of arrays; now, each inner array is an array of students reduced with OR logic.
      //
      // The next function will reduce those students down with AND logic.
      //
      // Example:
      //
      //   input ~> [
      //     [{FILTER:students_in_8th_grade}, {FILTER:students_in_7th_grade}],
      //     [{FILTER:students_with_high_math_scores}]
      //   ]
      //
      //   output ~> [
      //      [students_in_7th_or_8th_grade],
      //      [students_with_high_math_scores]
      //   ]

      var allStudents = this.props.allStudents;
      return filterGroups.map(function(filterGroup) {
        return filterGroup.reduce(function(filteredStudents, filter) {
          return _.uniq(filteredStudents.concat(allStudents.filter(filter.filterFn)));
        }, []);
      });
    },

    filterWithAnd: function (studentArrays) {
      // Expects an array of arrays as input.
      // Each inner array represents a group of students that has been reduced with OR logic.
      // Outputs a single array of all students at the intersection of the arrays (AND logic).

      return _.intersection.apply(this, studentArrays);
    },

    getFilteredStudents: function() {
      return this._filteredStudents;
    },

    setFilteredStudents: function(students) {
      this._filteredStudents = students;
      this.addToCache(students);
    },

    activeFiltersIdentifier: function () {
      // Something like this: 'equal:grade:5-equal:program_assigned:2Way English'

      return this.state.filters.map(function(filter) { return filter.identifier; }).join('-');
    },

    addToCache: function (students) {
      if (this._filterCache === undefined) this._filterCache = {};
      this._filterCache[this.activeFiltersIdentifier()] = students;
    },

    checkCache: function () {
      if (this._filterCache === undefined) return;
      return this._filterCache[this.activeFiltersIdentifier()];
    },

    filteredStudents: function() {
      // Filters are applied with OR logic within the same category; AND logic between categories.
      //
      // For example: "Students in 7th OR 8th grade AND with an advanced math score."
      //
      // There are five major filter states to handle:
      //
      // 1. No filters
      // 2. One filter                                      (no need to consider AND versus OR)
      // 3. Multiple filters within same category           (all OR)
      // 4. Multiple filters all different categories       (all AND)
      // 5. Multiple filters within and between categories  (OR plus AND)

      // Case 1, no filters:
      if (this.state.filters.length === 0) return this.props.allStudents;

      // Now there's some complexity. Let's check our client-side cache.
      if (this.checkCache() !== undefined) return this.checkCache();

      // Case 2, one filter:
      if (this.state.filters.length === 1) {
        return this.props.allStudents.filter(this.state.filters[0].filterFn);
      }

      // More than one filter, let's group the filters by category
      var activeFiltersByCategory = this.activeFiltersByCategory();

      // Filter students using OR logic within each category
      var studentsOrFiltered = this.filterWithOr.call(this, activeFiltersByCategory);

      // Case 3, all fiters within same category:
      // Return all of the students that have been filtered with OR logic
      if (activeFiltersByCategory.length === 1) return studentsOrFiltered[0];

      // Are there categories with more than one filter in them?
      var maxFiltersPerCategory = _.max(activeFiltersByCategory.map(function(category) {
        return category.length;
      }));

      // Case 4, multiple filters but all different categories:
      if (maxFiltersPerCategory === 1) {
        return this.state.filters.reduce(function(filteredStudents, filter) {
          return filteredStudents.filter(filter.filterFn);
        }, this.props.allStudents);
      }

      // Case 5, multiple filters within and between categories:
      return this.filterWithAnd.call(this, studentsOrFiltered);
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
      this.setFilteredStudents(this.filteredStudents());

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
            students: this.getFilteredStudents()
          })
        )
      );
    },

    renderSummary: function() {
      return dom.div({ className: 'summary', style: styles.summary },
        dom.div({ style: { backgroundColor: 'rgba(49, 119, 201, 0.75)', color: 'white', display: 'inline-block', width: '12em', padding: 5 } },
          'Found: ' + this.getFilteredStudents().length + ' students'
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
      var students = this.getFilteredStudents();
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
      var students = this.getFilteredStudents();
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

  // Define filter operations
  var Filters = {
    Range: function(key, range) {
      return {
        identifier: ['range', key, range[0], range[1]].join(':'),
        filterFn: function(student) {
          var value = student[key];
          return (_.isNumber(value) && value >= range[0] && value < range[1]);
        },
        key: key
      };
    },
    // Types are loose, since this is serialized from the hash
    Equal: function(key, value) {
      return {
        identifier: ['equal', key, value].join(':'),
        filterFn: function(student) {
          return (student[key] == value);
        },
        key: key
      };
    },
    Null: function(key) {
      return {
        identifier: ['null', key].join(':'),
        filterFn: function(student) {
          var value = student[key];
          return (value === null || value === undefined) ? true : false;
        },
        key: key
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
        },
        key: 'intervention_type'
      };
    },
    YearsEnrolled: function(value) {
      return {
        identifier: ['years_enrolled', value].join(':'),
        filterFn: function(student) {
          return (calculateYearsEnrolled(student.registration_date) === value);
        },
        key: 'years_enrolled'
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

  root.SchoolOverviewPage = SchoolOverviewPage;
  root.FixedTable = FixedTable;
  root.CollapsableTable = CollapsableTable;
  root.Filters = Filters;

})(window)
