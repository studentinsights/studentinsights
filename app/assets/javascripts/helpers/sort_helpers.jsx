import isInteger from 'lodash';

export default {

  sortByString(a, b, sortBy) {
    const stringA = a[sortBy];
    const stringB = b[sortBy];

    if (!stringA && !stringB) return 0;

    if (!stringA) return -1;
    if (!stringB) return 1;

    if (stringA.toUpperCase() < stringB.toUpperCase()) return -1;
    if (stringA.toUpperCase() > stringB.toUpperCase()) return 1;

    return 0;
  },

  sortByNumber(a, b, sortBy) {
    const numA = parseInt(a[sortBy]);
    const numB = parseInt(b[sortBy]);

    if (!isInteger(numA) && !isInteger(numB)) return 0;

    if (!isInteger(numA) || numA < numB) return 1;
    if (!isInteger(numB) || numA > numB) return -1;

    return 0;
  },

  sortByCustomEnum(a, b, sortBy, customEnum) {
    const indexA = customEnum.indexOf(a[sortBy]);
    const indexB = customEnum.indexOf(b[sortBy]);

    if (indexA > indexB) return 1;
    if (indexB > indexA) return -1;
    return 0;
  },

  sortByDate(a, b, sortBy) {
    const dateA = moment(a[sortBy], 'MM/D/YY');
    const dateB = moment(b[sortBy], 'MM/D/YY');

    if (!dateA.isValid() && !dateB.isValid()) return 0;

    if (!dateB.isValid() || dateA.isAfter(dateB)) return -1;
    if (!dateA.isValid() || dateA.isBefore(dateB)) return 1;

    return 0;
  },

  sortByActiveServices(a, b) {
    const numA = a.active_services.length;
    const numB = b.active_services.length;

    if (numA > numB) return 1;
    if (numB > numA) return -1;
    return 0;
  },

};
