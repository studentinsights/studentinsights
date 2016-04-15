(function() {
  window.shared || (window.shared = {});

  var QuadConverter = window.shared.QuadConverter;

  var Scales = window.shared.Scales = {
    mcas: {
      valueRange: [200, 300],
      threshold: 240
    },

    disciplineIncidents: {
      valueRange: [0, 6],
      threshold: 3,
      flexibleRange: function(cumulativeQuads) {
        return Scales.flexibleQuadRange(cumulativeQuads, Scales.disciplineIncidents.valueRange);
      }
    },

    absences: {
      valueRange: [0, 20],
      threshold: 10,
      flexibleRange: function(cumulativeQuads) {
        return Scales.flexibleQuadRange(cumulativeQuads, Scales.absences.valueRange);
      }
    },
    tardies: {
      valueRange: [0, 40],
      threshold: 20,
      flexibleRange: function(cumulativeQuads) {
        return Scales.flexibleQuadRange(cumulativeQuads, Scales.tardies.valueRange);
      }
    },

    // Take a valueRange and list of cumulativeQuads, and adjust the max so that the range
    // will always show the largest value.
    flexibleQuadRange: function(cumulativeQuads, valueRange) {
      var max = _.max([
        valueRange[1],
        d3.max(cumulativeQuads, QuadConverter.toValue)
      ]);
      return [valueRange[0], max];
    }
  };
})();
