const fs = require('fs');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');
const cors = require('cors');
const fetch = require('node-fetch');



function fetchMe() {
  return fetch('http://localhost:3000/me').then(r => r.json()).then(json => {
    return {
      fullName: json.full_name,
      schoolId: json.school_id,
      students: fetchStudents()
    };
  });
}

function fetchStudents() {
  return fetch('http://localhost:3000/me/students').then(r => r.json()).then(json => {
    const {students} = json;
    return {
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: null,
        endCursor: null
      },
      totalCount: students.length,
      edges: students.map(student => {
        return {
          cursor: null,
          node: student
        };
      }),
      nodes: students
    };
  });
}




// Construct a schema, using GraphQL schema language
const schema = buildSchema(fs.readFileSync('./simple.graphql').toString());

// The root provides a resolver function for each API endpoint
const root = {
  me: (object, args, context) => {
    console.log('me', object);
    return fetchMe();
  },
  Query: {
    me: (object, args, context) => {
      console.log('Query/me', object);
      return fetchMe();
    }
  },
  Educator: {
    favoriteStudent: (object, args, context) => {
      console.log('favoriteStudent', object);
      return { foo: 'bar' };
    },
    students: (object, args, context) => {
      console.log('students');
      return [];
    }
  },
  Student: (object, args, context) => {
    console.log('Student', object);
    return fetchStudents();
  }
};

const app = express();
app.use('/graphql', cors({ origin: 'http://localhost:3000'}), graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true
}));

app.listen(5000);
console.log('Running a GraphQL API server at localhost:5000/graphql');