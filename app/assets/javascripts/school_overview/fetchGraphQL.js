export default function fetchGraphQL(query, variables) {
  return fetch('http://localhost:5000/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({query, variables})
  }).then(r => r.json());
}