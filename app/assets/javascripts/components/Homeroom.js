import PropTypes from 'prop-types';
import React from 'react';
import Educator from './Educator';


// A visual UI element with canonical display of a homeroom,
// showing the name and teacher with link to roster.
export default function Homeroom({id, name, educator, disableLink, style = {}}) {
  return (
    <span className="Homeroom" style={{...style}}>
      {disableLink ? name : <a href={`/homerooms/${id}`}>{name}</a>}
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
  disableLink: PropTypes.bool,
  style: PropTypes.object
};

function renderEducator(educator) {
  return (
    <span>
      <span> </span> with <Educator educator={educator} />
    </span>
  );
}