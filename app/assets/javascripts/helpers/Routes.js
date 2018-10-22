import _ from 'lodash';
import qs from 'querystring';

// Routing functions
export function studentProfile(id, queryParams) {
  const queryString = _.isObject(queryParams)
    ? '?' + qs.stringify(queryParams)
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

export function newClassList() {
  return '/classlists/new';
}

export function studentPhoto(id) {
  return `/students/${id}/photo`;
}