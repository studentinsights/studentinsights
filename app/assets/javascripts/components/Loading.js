import React from 'react';


// Visual UI component to show a loading message
export default function Loading({style = {}}) {
  return <div style={{padding: 10, ...style}}>Loading...</div>;
}
Loading.propTypes = {
  style: React.PropTypes.object
};
