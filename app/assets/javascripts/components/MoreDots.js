import React from 'react';

// A visual UI element for horizontal dots indicating "more"
// See https://material.io/icons/#ic_more_horiz
function MoreDots({color = '#ccc'}) {
  return (
    <svg fill={color} height="18" viewBox="0 0 24 24" width="18" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
    </svg>
  );
}
MoreDots.propTypes = {
  color: React.PropTypes.string
};

export default MoreDots;
