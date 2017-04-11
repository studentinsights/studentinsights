(function(){
  function enumSort(values) {
        // For quick lookup, build a map:
    var position = {};
    $.each(values, function(idx, val) { position[val] = idx; });

    return {
      test: function(item) {
        return position[$.trim(item)] !== undefined;
      },
      compare: function(itemA, itemB) {
                // These are flipped in order so that the default order is ascending.
        return position[$.trim(itemB)] - position[$.trim(itemA)];
      }
    };
  }

    /**
     * Registers a new table sorter under the given name. Values should be an
     * array of strings specifying the _ascending_ order of the values.
     *
     * @param {String} name
     * @param {String[]} values
     */
  function makeEnumSort(name, values) {
    var sort = enumSort(values);
    Tablesort.extend(name, sort.test, sort.compare);
  }

  makeEnumSort("disability", ["None", "Low < 2", "Low >= 2", "Moderate", "High"]);
  makeEnumSort("prog_assign_sort", ["Reg Ed", "2Way English", "2Way Spanish", "Sp Ed"]);
  makeEnumSort("mcas_sort", ["W", "NI", "P", "A"]);
  makeEnumSort("fluency_sort", ["FLEP-Transitioning", "FLEP", "Fluent"]);
  makeEnumSort("need_sort", ["—", "Low < 2", "Low >= 2", "Moderate", "High"]);
}());
