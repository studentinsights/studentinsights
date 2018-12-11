import React from 'react';

export function Website(props) {
  return <a {...props} href="https://www.studentinsights.org">studentinsights.org</a>;
}

export function Email(props) {
  return <a {...props} href="mailto://ideas@studentinsights.org">ideas@studentinsights.org</a>;
}

export function WorkBoardIFrame(props) {
  return <iframe {...props} src="https://studentinsights.org/work-board.html" />;
}