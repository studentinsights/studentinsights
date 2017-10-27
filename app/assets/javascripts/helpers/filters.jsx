import _ from 'lodash';

(function() {
  // Define filter operations
  window.shared || (window.shared = {});

  const Filters = window.shared.Filters = {
    Range: function(key, range) {
      return {
        identifier: ['range', key, range[0], range[1]].join(':'),
        filterFn: function(student) {
          const value = student[key];
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
        identifier: ['none', key].join(':'),
        filterFn: function(student) {
          const value = student[key];
          return (value === null || value === undefined) ? true : false;
        },
        key: key
      };
    },
    InterventionType: function(interventionTypeId) {
      return {
        identifier: ['intervention_type', interventionTypeId].join(':'),
        filterFn: function(student) {
          if (interventionTypeId === null) return (student.interventions === undefined || student.interventions.length === 0);
          return student.interventions.filter(function(intervention) {
            return intervention.intervention_type_id === interventionTypeId;
          }).length > 0;
        },
        key: 'intervention_type'
      };
    },
    ServiceType: function(serviceTypeId) {
      return {
        identifier: ['service_type', serviceTypeId].join(':'),
        filterFn: function(student) {
          if (serviceTypeId === null) return (student.active_services === undefined || student.active_services.length === 0);
          return student.active_services.filter(function(service) {
            return service.service_type_id === serviceTypeId;
          }).length > 0;
        },
        key: 'service_type'
      };
    },
    SummerServiceType: function (serviceTypeId) {
      return {
        identifier: ['summer_service_type', serviceTypeId].join(':'),
        filterFn: function(student) {
          if (serviceTypeId === null) return (student.summer_services === undefined || student.summer_services.length === 0);
          return student.summer_services.filter(function(service) {
            return service.service_type_id === serviceTypeId;
          }).length > 0;
        },
        key: 'summer_service_type'
      };
    },
    EventNoteType: function(eventNoteTypeId) {
      return {
        identifier: ['event_note_type', eventNoteTypeId].join(':'),
        filterFn: function(student) {
          if (eventNoteTypeId === null) return (student.eventNotes.length === 0);
          return student.eventNotes.filter(function(eventNote) {
            return (eventNote.eventNoteTypeId === eventNoteTypeId);
          }).length > 0;
        },
        key: 'event_note_type'
      };
    },
    YearsEnrolled: function(value) {
      return {
        identifier: ['years_enrolled', value].join(':'),
        filterFn: function(student) {
          const yearsEnrolled = Math.floor((new Date() - new Date(student.registration_date)) / (1000 * 60 * 60 * 24 * 365));
          return (yearsEnrolled === value);
        },
        key: 'years_enrolled'
      };
    },

    // Has to parse from string back to numeric
    createFromIdentifier: function(identifier) {
      const parts = identifier.split(':');
      if (parts[0] === 'range') return Filters.Range(parts[1], [parseFloat(parts[2]), parseFloat(parts[3])]);
      if (parts[0] === 'none') return Filters.Null(parts[1]);
      if (parts[0] === 'equal') return Filters.Equal(parts[1], parts[2]);
      if (parts[0] === 'intervention_type') return Filters.InterventionType(parts[1]);
      if (parts[0] === 'risk_level') return Filters.InterventionType(parseFloat(parts[1]));
      if (parts[0] === 'years_enrolled') return Filters.YearsEnrolled(parseFloat(parts[1]));
      if (parts[0] === 'service_type') return Filters.ServiceType(parseFloat(parts[1]));
      if (parts[0] === 'event_note_type') return Filters.EventNoteType(parseFloat(parts[1]));

      return null;
    },

    // Returns a list of Filters
    parseFiltersHash: function(hash) {
      const pieces = _.compact(hash.slice(1).split('&'));
      return _.compact(pieces.map(function(piece) {
        return Filters.createFromIdentifier(window.decodeURIComponent(piece));
      }));
    }
  };
})();
