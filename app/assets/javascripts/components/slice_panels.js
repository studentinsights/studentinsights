(function() {

  window.shared || (window.shared = {});
  var CollapsableTable = window.shared.CollapsableTable;
  var styles = window.shared.styles;
  var colors = window.shared.colors;
  var dom = window.shared.ReactHelpers.dom;
  var createEl = window.shared.ReactHelpers.createEl;
  var merge = window.shared.ReactHelpers.merge;

  var SlicePanels = window.shared.SlicePanels = React.createClass({
    displayName: 'SlicePanels',
    propTypes: {
      filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      allStudents: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
      serviceTypesIndex: React.PropTypes.object.isRequired,
      eventNoteTypesIndex: React.PropTypes.object.isRequired,
      onFilterToggled: React.PropTypes.func.isRequired
    },

    render: function() {
      return dom.div({
        className: 'SlicePanels columns-container',
        style: {
          display: 'flex',
          width: '100%',
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
        this.renderMCASTable('MCAS ELA Score', 'most_recent_mcas_ela_scaled'),
        this.renderPercentileTable('MCAS ELA SGP', 'most_recent_mcas_ela_growth')
      );
    },

    renderMathColumn: function() {
      return dom.div({ className: 'column math-background' },
        this.renderPercentileTable('STAR Math', 'most_recent_star_math_percentile'),
        this.renderMCASTable('MCAS Math Score', 'most_recent_mcas_math_scaled'),
        this.renderPercentileTable('MCAS Math SGP', 'most_recent_mcas_math_growth')
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
          title: 'Services',
          items: this.serviceItems(),
          limit: 4
        }),
        this.renderTable({
          title: 'Summer',
          items: this.summerItems()
        }),
        this.renderTable({
          title: 'Notes',
          items: this.mergedNoteItems(),
          limit: 4
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

    serviceItems: function() {
      var students = this.props.allStudents;
      var activeServices = _.compact(_.flatten(_.pluck(students, 'active_services')));
      var allServiceTypeIds = _.unique(activeServices.map(function(service) {
        return parseInt(service.service_type_id, 10);
      }));

      var allServiceTypeIds = _.pull(allServiceTypeIds, 508);  // Deprecated Math intervention service type

      var serviceItems = allServiceTypeIds.map(function(serviceTypeId) {
        var serviceName = this.props.serviceTypesIndex[serviceTypeId].name;
        return this.createItem(serviceName, Filters.ServiceType(serviceTypeId));
      }, this);
      var sortedItems =  _.sortBy(serviceItems, function(item) {
        return -1 * students.filter(item.filter.filterFn).length;
      });

      return [this.createItem('None', Filters.ServiceType(null))].concat(sortedItems);
    },

    summerItems: function () {
      var students = this.props.allStudents;
      var summerServices = _.compact(_.flatten(_.pluck(students, 'summer_services')));
      var allSummerServiceTypeIds = _.unique(summerServices.map(function(service) {
        return parseInt(service.service_type_id, 10);
      }));

      var serviceItems = allSummerServiceTypeIds.map(function(serviceTypeId) {
        var serviceName = this.props.serviceTypesIndex[serviceTypeId].name;
        return this.createItem(serviceName, Filters.SummerServiceType(serviceTypeId));
      }, this);

      return [this.createItem('None', Filters.SummerServiceType(null))].concat(serviceItems);
    },

    // TODO(kr) add other note types
    mergedNoteItems: function() {
      var students = this.props.allStudents;
      var allEventNotes = _.compact(_.flatten(_.pluck(students, 'event_notes')));
      var allEventNoteTypesIds = _.unique(allEventNotes.map(function(eventNote) {
        return parseInt(eventNote.event_note_type_id, 10);
      }));
      var eventNoteItems = allEventNoteTypesIds.map(function(eventNoteTypeId) {
        var eventNoteTypeName = this.props.eventNoteTypesIndex[eventNoteTypeId].name;
        return this.createItem(eventNoteTypeName, Filters.EventNoteType(eventNoteTypeId));
      }, this);
      var sortedItems =  _.sortBy(eventNoteItems, function(item) {
        return -1 * students.filter(item.filter.filterFn).length;
      });

      return [this.createItem('None', Filters.EventNoteType(null))].concat(sortedItems);
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
      var key = 'risk_level';
      var items = [0, 1, 2, 3].map(function(value) {
        return this.createItem(value, Filters.Equal(key, value));
      }, this);

      items.push(this.createItem('N/A', Filters.Null(key)));

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
