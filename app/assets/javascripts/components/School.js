import PropTypes from 'prop-types';
import React from 'react';

// A visual UI element with canonical display of a school,
// showing the name with link to roster.
function School({id, name, style}) {
  return (
    <a
      className="School"
      style={{...style}}
      href={`/schools/${id}`}>{name}
    </a>
  );
}
School.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default School;