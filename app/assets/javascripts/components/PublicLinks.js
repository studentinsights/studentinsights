import React from 'react';


export function Website(props) {
  return <a {...props} href="https://www.studentinsights.org">www.studentinsights.org</a>;
}

export function Email(props) {
  return <a {...props} href="mailto://ideas@studentinsights.org">ideas@studentinsights.org</a>;
}
