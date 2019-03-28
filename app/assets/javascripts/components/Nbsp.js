import React from 'react';
import PropTypes from 'prop-types';


// non-breaking space, https://stackoverflow.com/a/24437562/5711971
export default function Nbsp({style = {}}) {
  return <span style={style}>{"\u00A0"}</span>;
}
Nbsp.propTypes = {
  style: PropTypes.object
};