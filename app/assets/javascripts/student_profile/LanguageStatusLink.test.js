import _ from 'lodash';
import {SOMERVILLE, BEDFORD, NEW_BEDFORD} from '../helpers/PerDistrict';
import {ALL_LANGUAGE_MAPS_FOR_TEST} from '../helpers/language';

export function allCombinations() {
  return _.flatMap([SOMERVILLE, NEW_BEDFORD, BEDFORD], districtKey => {
    const mapForDistrict = ALL_LANGUAGE_MAPS_FOR_TEST[districtKey];
    return Object.keys(mapForDistrict).concat([null]).map(limitedEnglishProficiency => {
      return {districtKey, limitedEnglishProficiency};
    });
  });
}