(function() {
  window.shared || (window.shared = {});

  var Scales = window.shared.Scales = {
    mcas: {
      valueRange: [200, 300],
      threshold: 240
    },
    disciplineIncidents: {
      valueRange: [0, 20],
      threshold: 10
    },
    absences: {
      valueRange: [0, 40],
      threshold: 20
    },
    tardies: {
      valueRange: [0, 60],
      threshold: 30
    }
  };
})();
