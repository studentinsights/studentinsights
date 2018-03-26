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
  id: React.PropTypes.number.isRequired,
  sectionNumber: React.PropTypes.string.isRequired,
  courseDescription: React.PropTypes.string.isRequired,
  style: React.PropTypes.object
};

export default Section;