describe('Filters', function() {
  var Filters = window.shared.Filters;

  var helpers = {
    students: function() {
      return [
       { services: [{ service_type_id: 504 }] },
       { services: [{ service_type_id: 503 }, { service_type_id: 501 }] },
       { services: [{ service_type_id: 504 }] },
       { services: [] }
      ];
    }
  };

  describe('#ServiceType', function() {
    it('filters for a value', function() {
      var filter = Filters.ServiceType(504);
      expect(filter.key).toEqual('service_type');
      expect(filter.identifier).toEqual('service_type:504');
      expect(helpers.students().filter(filter.filterFn).length).toEqual(2);
    });

    it('filters null', function() {
      var filter = Filters.ServiceType(null);
      expect(filter.key).toEqual('service_type');
      expect(filter.identifier).toEqual('service_type:');
      expect(helpers.students().filter(filter.filterFn).length).toEqual(1);
    });
  });
});