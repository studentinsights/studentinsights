import PropTypes from 'prop-types';
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
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  educator: PropTypes.shape({
    full_name: PropTypes.string, // or null
    email: PropTypes.string.isRequired
  }),
  style: PropTypes.object
};

export default Homeroom;