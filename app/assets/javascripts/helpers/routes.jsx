(function () {
  // Routing functions
  window.shared || (window.shared = {});
  window.shared.Routes = {
    studentProfile(id, queryParams) {
      const queryString = _.isObject(queryParams)
        ? `?${$.param(queryParams)}`
        : '';
      return `/students/${id}${queryString}`;
    },
    homeroom(id) {
      return `/homerooms/${id}`;
    },
    school(id) {
      return `/schools/${id}`;
    },
    section(id) {
      return `/sections/${id}`;
    }
  };
}());
