import React from 'react';
import PropTypes from 'prop-types';


export function Website(props) {
  return <a {...props} href="https://www.studentinsights.org">www.studentinsights.org</a>;
}

export function Email(props) {
  return <a {...props} href="mailto://ideas@studentinsights.org">ideas@studentinsights.org</a>;
}


export function WorkBoardIFrame(props) {  
  const workBoardUrl = 'https://www.studentinsights.org/work-board.html';
  if (process.env.NODE_ENV === 'test' && !props.forceIFrameDuringTest) return <div>(placeholder iframe to {workBoardUrl})</div>; // eslint-disable-line
  return <iframe {...props} src={workBoardUrl} />;
}
WorkBoardIFrame.propTypes = {
  forceIFrameDuringTest: PropTypes.bool
};