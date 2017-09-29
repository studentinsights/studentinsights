import _ from 'lodash';

export default {

  baseSortByString: function (stringA, stringB) {
    if (!stringA && !stringB) return 0;

    if (!stringA) return -1;
    if (!stringB) return 1;

    if (stringA.toUpperCase() < stringB.toUpperCase()) return -1;
    if (stringA.toUpperCase() > stringB.toUpperCase()) return 1;

    return 0;
  },

  sortByString: function (a, b, sortBy) {
    const stringA = a[sortBy];
    const stringB = b[sortBy];

    return this.baseSortByString(stringA, stringB);
  },

  sortByNumber: function (a, b, sortBy) {
    // Parsing all numbers by floats to retain the decimal in sorting
    const numA = parseFloat(a[sortBy]);
    const numB = parseFloat(b[sortBy]);

    if(numA === numB) return 0;
    if(_.isNaN(numA)) return 1;
    if(_.isNaN(numB)) return -1;
    return numA > numB ? -1 : 1;
  },

  sortByCustomEnum: function (a, b, sortBy, customEnum) {
    const indexA = customEnum.indexOf(a[sortBy]);
    const indexB = customEnum.indexOf(b[sortBy]);

    if (indexA > indexB) return 1;
    if (indexB > indexA) return -1;
    return 0;
  },

  sortByDate: function (a, b, sortBy) {
    const dateA = moment(a[sortBy], 'MM/D/YY');
    const dateB = moment(b[sortBy], 'MM/D/YY');

    if (!dateA.isValid() && !dateB.isValid()) return 0;

    if (!dateB.isValid() || dateA.isAfter(dateB)) return -1;
    if (!dateA.isValid() || dateA.isBefore(dateB)) return 1;

    return 0;
  },

  sortByActiveServices: function (a, b) {
    const numA = a.active_services.length;
    const numB = b.active_services.length;

    if (numA > numB) return 1;
    if (numB > numA) return -1;
    return 0;
  },

};
