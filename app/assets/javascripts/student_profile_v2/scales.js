(function() {
  window.shared || (window.shared = {});

  var Scales = window.shared.Scales = {
    mcas: {
      valueRange: [200, 300],
      threshold: 240
    },
    disciplineIncidents: {
      valueRange: [0, 6],
      threshold: 3
    },
    absences: {
      valueRange: [0, 20],
      threshold: 10
    },
    tardies: {
      valueRange: [0, 40],
      threshold: 20
    }
  };
})();
