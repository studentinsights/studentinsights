const _ = require('lodash');
const fs = require('fs');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');
const fetch = require('node-fetch');

function recursivelyCamelify(json) {
  if (_.isArray(json)) {
    return json.map(recursivelyCamelify);
  }
  if (_.isObject(json)) {
    return Object.keys(json).reduce((map, key) => {
      map[_.camelCase(key)] = recursivelyCamelify(json[key]);
      return map;
    }, {});
  }

  return json;
}

function json(path) {
  return fetch(path)
    .then(r => r.json())
    .then(recursivelyCamelify)
    .then(json => {
      console.log('>>> fetch ', path);
      // console.log(JSON.stringify(json, null, 2) + "\n\n");
      return json;
    });
    
}


function School(json) {
  return _.merge({}, json, {
    students: () => json.studentIds.map(id => {
      return root.Student({id});
    })
  });
}

function Student(json) {
  return _.merge({}, json, {
    eventNotes: () => json.eventNoteIds.map(id => {
      return root.EventNote({id});
    }),
    services: () => json.serviceIds.map(id => {
      return root.Service({id});
    })
  });
}


// Construct a schema, using GraphQL schema language
const schema = buildSchema(fs.readFileSync('./simple.graphql').toString());

// The root provides a resolver function for each API endpoint
const root = {
  currentEducator: (object, args, context) => json('http://localhost:3000/api/me'),
  school: (object, args, context) => json(`http://localhost:3000/api/schools/${object.id}`).then(School),
  serviceTypes: (object, args, context) => json('http://localhost:3000/api/service_types'),
  eventNoteTypes: (object, args, context) => json('http://localhost:3000/api/event_note_types'),
  Student: (object, args, context) => json(`http://localhost:3000/api/students/${object.id}`).then(Student),
  Service: (object, args, context) => json(`http://localhost:3000/api/service/${object.id}`),
  EventNote: (object, args, context) => json(`http://localhost:3000/api/event_note/${object.id}`)
};

const app = express();
app.use('/graphql', cors({ origin: 'http://localhost:3000'}), graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.listen(5000);
console.log('Running a GraphQL API server at localhost:5000/graphql');





// function fetchStudents() {
//   return json('http://localhost:3000/api/students').then(json => {
//     const {students} = json;
//     return {
//       pageInfo: {
//         hasNextPage: false,
//         hasPreviousPage: false,
//         startCursor: null,
//         endCursor: null
//       },
//       totalCount: students.length,
//       edges: students.map(student => {
//         return {
//           cursor: null,
//           node: student
//         };
//       }),
//       nodes: students
//     };
//   });
// }
