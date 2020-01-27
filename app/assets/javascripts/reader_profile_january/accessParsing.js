import {toMomentFromTimestamp} from '../helpers/toMoment';
import {readAccessOral} from '../helpers/language';


export function oralLanguageMaterialsFileKeys(access, gradeNow, nowMoment) {
  const dateTaken = accessDateTaken(readAccessOral(access));
  if (!dateTaken) return [];

  return []; // TODO(kr)
}

function accessDateTaken(accessDataPoint) {
  if (!accessDataPoint) return null;
  if (!accessDataPoint.date_taken) return null;
  return toMomentFromTimestamp(accessDataPoint.date_taken);
}
