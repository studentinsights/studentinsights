export default {

  sortByString: function (a, b, sortBy) {
    const stringA = a[sortBy];
    const stringB = b[sortBy];

    if (!stringA && !stringB) return 0;

    if (!stringA) return -1;
    if (!stringB) return 1;

    if (stringA.toUpperCase() < stringB.toUpperCase()) return -1;
    if (stringA.toUpperCase() > stringB.toUpperCase()) return 1;

    return 0;
  }

};
