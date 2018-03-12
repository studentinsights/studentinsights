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
  id: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  style: React.PropTypes.object
};

export default School;