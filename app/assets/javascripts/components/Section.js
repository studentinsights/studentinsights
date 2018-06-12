import PropTypes from 'prop-types';
import React from 'react';

// A visual UI element with canonical display of a section,
// showing the section number and course section, with link to roster.
function Section({id, sectionNumber, courseDescription, style}) {
  return (
    <a
      className="Section"
      style={{...style}}
      href={`/sections/${id}`}>{courseDescription} ({sectionNumber})
    </a>
  );
}

Section.propTypes = {
  id: PropTypes.number.isRequired,
  sectionNumber: PropTypes.string.isRequired,
  courseDescription: PropTypes.string.isRequired,
  style: PropTypes.object
};

export default Section;