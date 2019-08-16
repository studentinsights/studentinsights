/* to generate:
puts (ServiceType.all.reduce({}) do |map, service_type|
  json = service_type.as_json(except: [:created_at, :updated_at])
  map.merge(service_type.id => json)
end).to_json;nil
*/
export default {
  "502": {
    "id": 502,
    "name": "Attendance Officer",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "503": {
    "id": 503,
    "name": "Attendance Contract",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "504": {
    "id": 504,
    "name": "Behavior Contract",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "505": {
    "id": 505,
    "name": "Counseling, in-house",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "506": {
    "id": 506,
    "name": "Counseling, outside",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "507": {
    "id": 507,
    "name": "Reading intervention",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "508": {
    "id": 508,
    "name": "Math intervention",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "509": {
    "id": 509,
    "name": "SomerSession",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "510": {
    "id": 510,
    "name": "Summer Program for English Language Learners",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "511": {
    "id": 511,
    "name": "Afterschool Tutoring",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "512": {
    "id": 512,
    "name": "Freedom School",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "513": {
    "id": 513,
    "name": "Community Schools",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  },
  "514": {
    "id": 514,
    "name": "X-Block",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null,
    "fdescription": null
  }
};