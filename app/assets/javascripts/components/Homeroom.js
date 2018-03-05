import React from 'react';
import Educator from './Educator';

function renderEducator(educator) {
  return (
    <span>
      <span> </span> with <Educator educator={educator} />
    </span>
  );
}

// A visual UI element with canonical display of a homeroom,
// showing the name and teacher with link to roster.
function Homeroom({id, name, educator, style}) {
  return (
    <span className="Homeroom" style={{...style}}>
      <a href={`/homerooms/${id}`}>{name}</a>
      {educator && renderEducator(educator)}
    </span>
  );
}
Homeroom.propTypes = {
  id: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  educator: React.PropTypes.shape({
    full_name: React.PropTypes.string, // or null
    email: React.PropTypes.string.isRequired
  }),
  style: React.PropTypes.object
};

export default Homeroom;