import * as Filters from '../../../app/assets/javascripts/helpers/Filters';

describe('Filters', function() {
  const helpers = {
    students: function() {
      return [
       { active_services: [{ service_type_id: 504 }] },
       { active_services: [{ service_type_id: 503 }, { service_type_id: 501 }] },
       { active_services: [{ service_type_id: 504 }] },
       { active_services: [] }
      ];
    }
  };

  describe('#ServiceType', function() {
    it('filters for a value', function() {
      const filter = Filters.ServiceType(504);
      expect(filter.key).toEqual('service_type');
      expect(filter.identifier).toEqual('service_type:504');
      expect(helpers.students().filter(filter.filterFn).length).toEqual(2);
    });

    it('filters null', function() {
      const filter = Filters.ServiceType(null);
      expect(filter.key).toEqual('service_type');
      expect(filter.identifier).toEqual('service_type:');
      expect(helpers.students().filter(filter.filterFn).length).toEqual(1);
    });
  });
});