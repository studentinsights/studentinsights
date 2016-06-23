(function(root) {
  window.shared || (window.shared = {});
  var Filters = window.shared.Filters;
  var Routes = window.shared.Routes;
  var SlicePanels = window.shared.SlicePanels;
  var SliceButtons = window.shared.SliceButtons;
  var styles = window.shared.styles;
  var colors = window.shared.colors;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  function calculateYearsEnrolled (registration_date) {
    if (registration_date === null) return null;
    return Math.floor((new Date() - new Date(registration_date)) / (1000 * 60 * 60 * 24 * 365));
  };

  var SchoolOverviewPage = React.createClass({
    displayName: 'SchoolOverviewPage',

    propTypes: {
      allStudents: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      initialFilters: React.PropTypes.arrayOf(React.PropTypes.object)
    },

    getInitialState: function() {
      return { filters: this.props.initialFilters };
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
    // key code 27 is the ESC key
    //onKeyDown: function(e) {
    //  if (e.keyCode === 27) this.clearFilters();
    //},

    render: function() {
      this.setFilteredStudents(this.filteredStudents());

      return dom.div({
        className: 'school-overview',
        style: { fontSize: styles.fontSize }
      },
	dom.div({ className: 'header', style: styles.header }, createEl(SlicePanels, {
	  allStudents: this.props.allStudents,
          students: this.getFilteredStudents(),
          serviceTypesIndex: this.props.serviceTypesIndex,
          eventNoteTypesIndex: this.props.eventNoteTypesIndex,
          filters: this.state.filters,
          onFilterToggled: this.onFilterToggled
	})),
        dom.div({ className: 'summary', style: styles.summary }, createEl(SliceButtons, {
	  students: this.getFilteredStudents(),
	  filters: this.state.filters,
	  filtersHash: this.filtersHash(),
	  activeFiltersIdentifier: this.activeFiltersIdentifier(),
	  clearFilters: this.clearFilters
	})),
	
	
	dom.div({ className: 'list', style: { padding: 20 } },
          createEl(StudentsTable, {
            key: _.pluck(this.state.filters, 'identifier').join(','), // hack for tablesorter
            students: this.getFilteredStudents()
          })
        )
      );
    },

    filtersHash: function() {
      return '#' + this.state.filters.map(function(filter) {
        return encodeURIComponent(filter.identifier);
      }).join('&');
    },
  });

  window.shared.SchoolOverviewPage = SchoolOverviewPage;
})(window)
