import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import IncidentCard from './IncidentCard';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';


function testProps(props = {}) {
  return {
    incidentCard: {
      "id": 21,
      "incident_code": "OT",
      "incident_location": "Locker room/gym",
      "incident_description": "Earlier today something happened with the student that was concerning and we did this to de-escalate and support them in the moment, and then took these steps to understand the underlying challenges they're facing, and adapt how we're working with them moving forward.",
      "occurred_at": "2018-02-28T05:00:00.000Z",
      "has_exact_time": false,
      "student": {
        "id": 100,
        "grade": "10",
        "first_name": "Mowgli",
        "last_name": "Pan",
        "house": "Beacon",
        "homeroom": {
          "id": 4,
          "name": "SHS ALL"
        }
      }
    },
    ...props
  };
}

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<IncidentCard {...props} />), el);
});

it('matches snapshot', () => {
  const props = testProps();
  const tree = renderer
    .create(withDefaultNowContext(<IncidentCard {...props} />))
    .toJSON();
  expect(tree).toMatchSnapshot();
});
