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
    "data_owner": null
  },
  "503": {
    "id": 503,
    "name": "Attendance Contract",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "504": {
    "id": 504,
    "name": "Behavior Contract",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "505": {
    "id": 505,
    "name": "Counseling, in-house",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "506": {
    "id": 506,
    "name": "Counseling, outside",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "507": {
    "id": 507,
    "name": "Reading intervention",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "508": {
    "id": 508,
    "name": "Math intervention",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "511": {
    "id": 511,
    "name": "Afterschool Tutoring",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "513": {
    "id": 513,
    "name": "Community Schools",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "514": {
    "id": 514,
    "name": "X-Block",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "509": {
    "id": 509,
    "name": "SomerSession",
    "summer_program": true,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "510": {
    "id": 510,
    "name": "Summer Program for English Language Learners",
    "summer_program": true,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "512": {
    "id": 512,
    "name": "Freedom School",
    "summer_program": true,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "515": {
    "id": 515,
    "name": "Calculus Project",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "516": {
    "id": 516,
    "name": "Boston Breakthrough",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "517": {
    "id": 517,
    "name": "Summer Explore",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "518": {
    "id": 518,
    "name": "Focused Math Intervention",
    "summer_program": false,
    "description": null,
    "intensity": null,
    "data_owner": null
  },
  "701": {
    "id": 701,
    "name": "Title 1 Math intervention",
    "summer_program": false,
    "description": "Title One Math afterschool program",
    "intensity": "2 x 45",
    "data_owner": "AP at Lane, this is only a Lane program"
  },
  "702": {
    "id": 702,
    "name": "Lunch bunch",
    "summer_program": false,
    "description": "Small group lunch bunch with counseling staff focusing on social skills",
    "intensity": "1x20min",
    "data_owner": "counselor"
  },
  "703": {
    "id": 703,
    "name": "Soc.emo check in",
    "summer_program": false,
    "description": "Short regular check ins",
    "intensity": "1-3x 10min",
    "data_owner": "counselor"
  },
  "704": {
    "id": 704,
    "name": "Individual Counseling",
    "summer_program": false,
    "description": "1:1 counseling sessions",
    "intensity": "1x30 min",
    "data_owner": "counselor"
  },
  "705": {
    "id": 705,
    "name": "Social Group",
    "summer_program": false,
    "description": "Small groups",
    "intensity": "1 or 2 x 30",
    "data_owner": "counselor"
  },
  "706": {
    "id": 706,
    "name": "Reading intervention, with specialist",
    "summer_program": false,
    "description": "Specific documented reading intervention",
    "intensity": "2-3 x 30",
    "data_owner": "specialist"
  },
  "707": {
    "id": 707,
    "name": "LLI Reading Instruction",
    "summer_program": false,
    "description": "Leveled Literacy Instruction by trained staff",
    "intensity": "5x30",
    "data_owner": "specialist"
  },
  "708": {
    "id": 708,
    "name": "Math Intervention, small group",
    "summer_program": false,
    "description": "Interventions developed with math CC, typically delivered in small group, occasionally one on one",
    "intensity": "Varies 2-5x per week",
    "data_owner": "Classroom staff w/ math CC consult"
  },
  "709": {
    "id": 709,
    "name": "Formal Behavior Plan",
    "summer_program": false,
    "description": "Behavior plan written by or in consultation with BCBA",
    "intensity": "varies",
    "data_owner": "BCBA"
  }
};