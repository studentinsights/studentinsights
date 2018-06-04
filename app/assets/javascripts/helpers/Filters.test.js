import * as Filters from './Filters';

const helpers = {
  students() {
    return [
     { active_services: [{ service_type_id: 504 }] },
     { active_services: [{ service_type_id: 503 }, { service_type_id: 501 }] },
     { active_services: [{ service_type_id: 504 }] },
     { active_services: [] }
    ];
  }
};

describe('#ServiceType', () => {
  it('filters for a value', () => {
    const filter = Filters.ServiceType(504);
    expect(filter.key).toEqual('service_type');
    expect(filter.identifier).toEqual('service_type:504');
    expect(helpers.students().filter(filter.filterFn).length).toEqual(2);
  });

  it('filters null', () => {
    const filter = Filters.ServiceType(null);
    expect(filter.key).toEqual('service_type');
    expect(filter.identifier).toEqual('service_type:');
    expect(helpers.students().filter(filter.filterFn).length).toEqual(1);
  });
});