import _ from 'lodash';
import {SOMERVILLE, BEDFORD, NEW_BEDFORD} from '../helpers/PerDistrict';
import {TESTING_ONLY_ALL_LANGUAGE_MAPS} from '../helpers/language';

export function allCombinations() {
  return _.flatMap([SOMERVILLE, NEW_BEDFORD, BEDFORD], districtKey => {
    const mapForDistrict = TESTING_ONLY_ALL_LANGUAGE_MAPS[districtKey];
    return Object.keys(mapForDistrict).concat([null]).map(limitedEnglishProficiency => {
      return {districtKey, limitedEnglishProficiency};
    });
  });
}