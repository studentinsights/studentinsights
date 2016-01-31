(function() {

  window.shared || (window.shared = {});
  var Filters = window.shared.Filters;
  var Routes = window.shared.Routes;
  var SlicePanels = window.shared.SlicePanels;
  var styles = window.shared.styles;
  var colors = window.shared.colors;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  // fixed items, already sorted, no collapsing
  var FixedTable = React.createClass({
    displayName: 'FixedTable',

    onRowClicked: function(item, e) {
      this.props.onFilterToggled(item.filter);
    },

    render: function() {
      return this.renderTableFor(this.props.title, this.props.items, this.props);
    },

    // title height is fixed since font-weight causes loading a font which delays initial render
    renderTableFor: function(title, items, options) {
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
        dom.div({ className: 'FixedTable', style: { marginBottom: 5, paddingLeft: 5, fontWeight: 'bold', height: '1em' }}, title),
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
          children: this.renderCollapseOrExpand()
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
          display: 'block'
        },
        onClick: (this.state.isExpanded) ? this.onCollapseClicked : this.onExpandClicked
      }, (this.state.isExpanded) ? '- Hide details' : '+ Show all');

    }
  });

  window.shared.SlicePanels = React.createClass({
    displayName: 'SlicePanels',
    propTypes: {
      filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      allStudents: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      InterventionTypes: React.PropTypes.object.isRequired,
      onFilterToggled: React.PropTypes.func.isRequired
    },

    render: function() {
      return dom.div({
        className: 'SlicePanels columns-container',
        style: {
          display: 'flex',
          flexDirection: 'row',
          fontSize: styles.fontSize
        }
      },
        this.renderProfileColumn(),
        this.renderGradeColumn(),
        this.renderELAColumn(),
        this.renderMathColumn(),
        this.renderAttendanceColumn(),
        this.renderInterventionsColumn()
      );
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
        this.renderAttendanceTable('Absences', 'absences_count'),
        this.renderAttendanceTable('Tardies', 'tardies_count')
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
        this.renderSimpleTable('Homeroom', 'homeroom_name', {
          limit: 3,
          students: this.props.students // these items won't be static
        })
      );
    },

    createItem: function(caption, filter) {
      var students = this.props.students;
      return {
        caption: caption,
        percentage: (students.length === 0) ? 0 : students.filter(filter.filterFn).length / students.length,
        filter: filter
      };
    },

    interventionItems: function() {
      var students = this.props.allStudents;
      var allInterventions = _.compact(_.flatten(_.pluck(students, 'interventions')));
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
        this.renderYearsEnrolled(),
        this.renderRiskLevel()
      );
    },

    renderRiskLevel: function() {
      var items = [0, 1, 2, 3].map(function(value) {
        return this.createItem(value, Filters.RiskLevel(value));
      }, this);

      return this.renderTable({
        title: 'Risk level',
        items: items
      });
    },

    renderYearsEnrolled: function() {
      var uniqueValues = _.compact(_.unique(this.props.allStudents.map(function(student) {
        return Math.floor((new Date() - new Date(student.registration_date)) / (1000 * 60 * 60 * 24 * 365));
      })));
      var items = uniqueValues.map(function(value) {
        return this.createItem(value, Filters.YearsEnrolled(value));
      }, this);
      var sortedItems = _.sortBy(items, function(item) { return parseFloat(item.caption); });

      return this.renderTable({
        title: 'Years enrolled',
        items: sortedItems,
        limit: 3
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
      var uniqueValues = _.unique(_.pluck(props.students || this.props.allStudents, key));
      var items = this.createItemsFromValues(key, uniqueValues);
      return this.renderTable(merge(props || {}, {
        title: title,
        items: items
      }));
    },

    renderTable: function(props) {
      return createEl(CollapsableTable, merge(props, {
        filters: this.props.filters,
        onFilterToggled: this.props.onFilterToggled
      }));
    }
  });

})();
