import _ from 'lodash';

// Routing functions
export function studentProfile(id, queryParams) {
  const queryString = _.isObject(queryParams)
    ? '?' + $.param(queryParams)
    : '';
  return '/students/' + id + queryString;
}

export function homeroom(id) {
  return '/homerooms/' + id;
}

export function school(id) {
  return '/schools/' + id;
}

export function section(id) {
  return '/sections/' + id;
}

export function districtwideAdmin() {
  return '/educators/districtwide';
}

export function absencesDashboard(schoolId) {
  return `/schools/${schoolId}/school_administrator_dashboard#/absences_dashboard`;
}

export function tardiesDashboard(schoolId) {
  return `/schools/${schoolId}/school_administrator_dashboard#/tardies_dashboard`;
}
