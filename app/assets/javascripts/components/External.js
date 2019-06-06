import PropTypes from 'prop-types';
import React from 'react';


// External link
export default function External(props) {
  const {children} = props;
  return (
    <a
      className="External"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >{children}</a>
  );
}
External.propTypes = {
  children: PropTypes.node.isRequired
};
