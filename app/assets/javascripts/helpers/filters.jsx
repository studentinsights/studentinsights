(function () {
  // Define filter operations
  window.shared || (window.shared = {});

  const Filters = window.shared.Filters = {
    Range(key, range) {
      return {
        identifier: ['range', key, range[0], range[1]].join(':'),
        filterFn(student) {
          const value = student[key];
          return (_.isNumber(value) && value >= range[0] && value < range[1]);
        },
        key
      };
    },
    // Types are loose, since this is serialized from the hash
    Equal(key, value) {
      return {
        identifier: ['equal', key, value].join(':'),
        filterFn(student) {
          return (student[key] == value);
        },
        key
      };
    },
    Null(key) {
      return {
        identifier: ['none', key].join(':'),
        filterFn(student) {
          const value = student[key];
          return !!((value === null || value === undefined));
        },
        key
      };
    },
    InterventionType(interventionTypeId) {
      return {
        identifier: ['intervention_type', interventionTypeId].join(':'),
        filterFn(student) {
          if (interventionTypeId === null) return (student.interventions === undefined || student.interventions.length === 0);
          return student.interventions.filter(intervention => intervention.intervention_type_id === interventionTypeId).length > 0;
        },
        key: 'intervention_type'
      };
    },
    ServiceType(serviceTypeId) {
      return {
        identifier: ['service_type', serviceTypeId].join(':'),
        filterFn(student) {
          if (serviceTypeId === null) return (student.active_services === undefined || student.active_services.length === 0);
          return student.active_services.filter(service => service.service_type_id === serviceTypeId).length > 0;
        },
        key: 'service_type'
      };
    },
    SummerServiceType(serviceTypeId) {
      return {
        identifier: ['summer_service_type', serviceTypeId].join(':'),
        filterFn(student) {
          if (serviceTypeId === null) return (student.summer_services === undefined || student.summer_services.length === 0);
          return student.summer_services.filter(service => service.service_type_id === serviceTypeId).length > 0;
        },
        key: 'summer_service_type'
      };
    },
    EventNoteType(eventNoteTypeId) {
      return {
        identifier: ['event_note_type', eventNoteTypeId].join(':'),
        filterFn(student) {
          if (eventNoteTypeId === null) return (student.event_notes.length === 0);
          return student.event_notes.filter(eventNote => (eventNote.event_note_type_id === eventNoteTypeId)).length > 0;
        },
        key: 'event_note_type'
      };
    },
    YearsEnrolled(value) {
      return {
        identifier: ['years_enrolled', value].join(':'),
        filterFn(student) {
          const yearsEnrolled = Math.floor((new Date() - new Date(student.registration_date)) / (1000 * 60 * 60 * 24 * 365));
          return (yearsEnrolled === value);
        },
        key: 'years_enrolled'
      };
    },

    // Has to parse from string back to numeric
    createFromIdentifier(identifier) {
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
    parseFiltersHash(hash) {
      const pieces = _.compact(hash.slice(1).split('&'));
      return _.compact(pieces.map(piece => Filters.createFromIdentifier(window.decodeURIComponent(piece))));
    }
  };
}());
