import React from 'react';
import _ from 'lodash';
import CollapsableTable from './CollapsableTable';
import FixedTable from './FixedTable';
import {styles} from '../helpers/Theme';
import * as Filters from '../helpers/Filters';
import {shouldDisplay} from '../helpers/customization_helpers.js';

// For showing a set of panels that let users see an overview
// of distributions, and click to filter a set of data in different
// ways.
class SlicePanels extends React.Component {
  createItem(caption, filter) {
    const students = this.props.students;
    return {
      caption: caption,
      percentage: (students.length === 0) ? 0 : students.filter(filter.filterFn).length / students.length,
      filter: filter
    };
  }

  createItemsFromValues(key, uniqueValues) {
    const items = _.compact(uniqueValues).map(function(value) {
      return this.createItem(value, Filters.Equal(key, value));
    }, this);
    const itemsWithNull = (_.any(uniqueValues, _.isNull))
      ? items.concat(this.createItem('None', Filters.Null(key)))
      : items;
    const students = this.props.allStudents;
    return _.sortBy(itemsWithNull, function(item) {
      return -1 * students.filter(item.filter.filterFn).length;
    });
  }

  serviceItems() {
    const students = this.props.allStudents;
    const activeServices = _.compact(_.flatten(_.map(students, 'active_services')));
    const activeServiceTypeIds = activeServices.map(service => parseInt(service.service_type_id, 10));
    const allServiceTypeIds = _.pull(_.unique(activeServiceTypeIds), 508); // Deprecated Math intervention service type

    const serviceItems = allServiceTypeIds.map(function(serviceTypeId) {
      const serviceName = this.props.serviceTypesIndex[serviceTypeId].name;
      return this.createItem(serviceName, Filters.ServiceType(serviceTypeId));
    }, this);
    const sortedItems =  _.sortBy(serviceItems, function(item) {
      return -1 * students.filter(item.filter.filterFn).length;
    });

    return [this.createItem('None', Filters.ServiceType(null))].concat(sortedItems);
  }

  summerItems () {
    const students = this.props.allStudents;
    const summerServices = _.compact(_.flatten(_.map(students, 'summer_services')));
    const allSummerServiceTypeIds = _.unique(summerServices.map(function(service) {
      return parseInt(service.service_type_id, 10);
    }));

    const serviceItems = allSummerServiceTypeIds.map(function(serviceTypeId) {
      const serviceName = this.props.serviceTypesIndex[serviceTypeId].name;
      return this.createItem(serviceName, Filters.SummerServiceType(serviceTypeId));
    }, this);

    return [this.createItem('None', Filters.SummerServiceType(null))].concat(serviceItems);
  }

  // TODO(kr) add other note types
  mergedNoteItems() {
    const students = this.props.allStudents;
    const allEventNotes = _.compact(_.flatten(_.map(students, 'event_notes')));
    const allEventNoteTypesIds = _.unique(allEventNotes.map(function(eventNote) {
      return parseInt(eventNote.event_note_type_id, 10);
    }));
    const eventNoteItems = allEventNoteTypesIds.map(function(eventNoteTypeId) {
      const eventNoteTypeName = this.props.eventNoteTypesIndex[eventNoteTypeId].name;
      return this.createItem(eventNoteTypeName, Filters.EventNoteType(eventNoteTypeId));
    }, this);
    const sortedItems =  _.sortBy(eventNoteItems, function(item) {
      return -1 * students.filter(item.filter.filterFn).length;
    });

    return [this.createItem('None', Filters.EventNoteType(null))].concat(sortedItems);
  }

  MCASFilterItems(key) {
    const nullItem = [this.createItem('None', Filters.Null(key))];
    const nextGenMCASFilters = [
      this.createItem('Not Meeting Expectations', Filters.Range(key, [400, 450])),
      this.createItem('Partially Meeting', Filters.Range(key, [450, 500])),
      this.createItem('Meeting Expectations', Filters.Range(key, [500, 550])),
      this.createItem('Exceeding Expectations', Filters.Range(key, [260, 281]))
    ];
    const oldMCASFilters = [
      this.createItem('Warning', Filters.Range(key, [200, 220])),
      this.createItem('Needs Improvement', Filters.Range(key, [220, 240])),
      this.createItem('Proficient', Filters.Range(key, [240, 260])),
      this.createItem('Advanced', Filters.Range(key, [260, 281])),
    ];

    const sortedScores = _.compact(_.map(this.props.students, key)).sort();
    const medianScore = sortedScores[Math.floor(sortedScores.length / 2)];

    if (medianScore > 280) return nullItem.concat(nextGenMCASFilters, oldMCASFilters);

    return nullItem.concat(oldMCASFilters, nextGenMCASFilters);
  }

  render() {
    return (
      <div
        className="SlicePanels columns-container"
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'row',
          fontSize: styles.fontSize
        }}>
        {this.renderProfileColumn()}
        {this.renderGradeColumn()}
        {this.renderELAColumn()}
        {this.renderMathColumn()}
        {this.renderAttendanceColumn()}
        {this.renderInterventionsColumn()}
      </div>
    );
  }

  renderProfileColumn() {
    return (
      <div className="column">
        {this.renderDisabilityTable()}
        {this.renderSimpleTable('Low Income', 'free_reduced_lunch', { limit: 4 })}
        {this.renderSimpleTable('LEP', 'limited_english_proficiency', { limit: 3 })}
        {this.renderSimpleTable('Race', 'race', {})}
        <FixedTable
          onFilterToggled={this.props.onFilterToggled}
          filters={this.props.filters}
          title="Hispanic/Latino"
          items={[
            this.createItem('Yes', Filters.Equal('hispanic_latino', true)),
            this.createItem('No', Filters.Equal('hispanic_latino', false)),
            this.createItem('None', Filters.Equal('hispanic_latino', null)),
          ]} />
        {this.renderSimpleTable('Gender', 'gender', {})}
      </div>
    );
  }

  renderDisabilityTable() {
    const key = 'sped_level_of_need';
    const items = ['Low < 2', 'Low >= 2', 'Moderate', 'High'].map(function(value) {
      return this.createItem(value, Filters.Equal(key, value));
    }, this);
    return this.renderTable({
      title: 'Disability',
      items: [this.createItem('None', Filters.Null(key))].concat(items)
    });
  }

  renderELAColumn() {
    return (
      <div className="column ela-background">
        {this.renderPercentileTable('STAR Reading', 'most_recent_star_reading_percentile')}
        {this.renderMCASTable('MCAS ELA Score', 'most_recent_mcas_ela_scaled')}
        {this.renderPercentileTable('MCAS ELA SGP', 'most_recent_mcas_ela_growth')}
      </div>
    );
  }

  renderMathColumn() {
    return (
      <div className="column math-background">
        {this.renderPercentileTable('STAR Math', 'most_recent_star_math_percentile')}
        {this.renderMCASTable('MCAS Math Score', 'most_recent_mcas_math_scaled')}
        {this.renderPercentileTable('MCAS Math SGP', 'most_recent_mcas_math_growth')}
      </div>
    );
  }

  renderPercentileTable(title, key, props = {}) {
    return this.renderTable({
      ...props,
      title: title,
      items: [this.createItem('None', Filters.Null(key))].concat([
        this.createItem('< 25th', Filters.Range(key, [0, 25])),
        this.createItem('25th - 50th', Filters.Range(key, [25, 50])),
        this.createItem('50th - 75th', Filters.Range(key, [50, 75])),
        this.createItem('> 75th', Filters.Range(key, [75, 100]))
      ])
    });
  }

  renderMCASTable(title, key, props = {}) {
    const filterItems = this.MCASFilterItems(key);

    return this.renderTable({
      ...props,
      title: title,
      items: filterItems,
      limit: 5
    });
  }

  renderAttendanceColumn() {
    return (
      <div
        className="column attendance-column attendance-background pad-column-right">
        {this.renderDisciplineTable()}
        {this.renderAttendanceTable('Absences', 'absences_count')}
        {this.renderAttendanceTable('Tardies', 'tardies_count')}
      </div>
    );
  }

  renderDisciplineTable() {
    const key = 'discipline_incidents_count';
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
  }

  renderAttendanceTable(title, key) {
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
  }

  renderInterventionsColumn() {
    return (
      <div className="column interventions-column">
        {this.renderTable({
          title: 'Services',
          items: this.serviceItems(),
          limit: 4
        })}
        {this.renderTable({
          title: 'Summer',
          items: this.summerItems()
        })}
        {this.renderTable({
          title: 'Notes',
          items: this.mergedNoteItems(),
          limit: 4
        })}
        {this.renderSimpleTable('Program', 'program_assigned', { limit: 3 })}
        {this.renderSimpleTable('Homeroom', 'homeroom_name', {
          limit: 3,
          students: this.props.students // these items won't be static
        })}
      </div>
    );
  }

  renderGradeTable() {
    const key = 'grade';
    const uniqueValues = _.compact(_.unique(_.map(this.props.allStudents, key)));
    const items = uniqueValues.map(function(value) {
      return this.createItem(value, Filters.Equal(key, value));
    }, this);
    const sortedItems = _.sortBy(items, function(item) {
      if (item.caption === 'PK') return -20;
      if (item.caption === 'KF') return -10;
      return parseFloat(item.caption);
    });

    return this.renderTable({
      title: 'Grade',
      items: sortedItems,
      limit: 10
    });
  }

  renderGradeColumn() {
    return (
      <div className="column grades-column pad-column-right">
        {this.renderGradeTable()}
        {shouldDisplay('house',this.props.school) && this.renderSimpleTable('House', 'house', {})}
        {shouldDisplay('counselor',this.props.school) && this.renderSimpleTable('Counselor', 'counselor', {limit:4})}
        {this.renderYearsEnrolled()}
        {this.renderRiskLevel()}
      </div>
    );
  }

  renderRiskLevel() {
    const key = 'risk_level';
    const items = [0, 1, 2, 3].map(function(value) {
      return this.createItem(value, Filters.Equal(key, value));
    }, this);

    items.push(this.createItem('N/A', Filters.Null(key)));

    return this.renderTable({
      title: 'Risk level',
      items: items
    });
  }

  renderYearsEnrolled() {
    const uniqueValues = _.compact(_.unique(this.props.allStudents.map(function(student) {
      return Math.floor((new Date() - new Date(student.registration_date)) / (1000 * 60 * 60 * 24 * 365));
    })));
    const items = uniqueValues.map(function(value) {
      return this.createItem(value, Filters.YearsEnrolled(value));
    }, this);
    const sortedItems = _.sortBy(items, function(item) { return parseFloat(item.caption); });

    return this.renderTable({
      title: 'Years enrolled',
      items: sortedItems,
      limit: 3
    });
  }

  renderSimpleTable(title, key, props = {}) {
    const uniqueValues = _.unique(_.map(props.students || this.props.allStudents, key));
    const items = this.createItemsFromValues(key, uniqueValues);
    return this.renderTable({
      ...props,
      title: title,
      items: items
    });
  }

  renderTable(tableProps = {}) {
    const props = {
      ...tableProps,
      filters: this.props.filters,
      onFilterToggled: this.props.onFilterToggled
    };
    return <CollapsableTable {...props} />;
  }
}
SlicePanels.propTypes = {
  filters: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  students: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  allStudents: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
  school: React.PropTypes.object.isRequired,
  serviceTypesIndex: React.PropTypes.object.isRequired,
  eventNoteTypesIndex: React.PropTypes.object.isRequired,
  onFilterToggled: React.PropTypes.func.isRequired
};

export default SlicePanels;
