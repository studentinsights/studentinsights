import _ from 'lodash';
import {toValue} from './QuadConverter';


const Scales = {
  mcas: {
    valueRange: [200, 300],
    threshold: 240
  },

  disciplineIncidents: {
    valueRange: [0, 6],
    threshold: 3,
    flexibleRange(cumulativeQuads) {
      return Scales.flexibleQuadRange(cumulativeQuads, Scales.disciplineIncidents.valueRange);
    }
  },

  absences: {
    valueRange: [0, 20],
    threshold: 5,
    flexibleRange(cumulativeQuads) {
      return Scales.flexibleQuadRange(cumulativeQuads, Scales.absences.valueRange);
    }
  },

  tardies: {
    valueRange: [0, 20],
    threshold: 5,
    flexibleRange(cumulativeQuads) {
      return Scales.flexibleQuadRange(cumulativeQuads, Scales.tardies.valueRange);
    }
  },

  // Take a valueRange and list of cumulativeQuads, and adjust the max so that the range
  // will always show the largest value.
  flexibleQuadRange(cumulativeQuads, valueRange) {
    const max = _.max([
      valueRange[1],
      _.max([cumulativeQuads, toValue])
    ]);
    return [valueRange[0], max];
  }

};

export default Scales;
