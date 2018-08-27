import PropTypes from 'prop-types';
import React from 'react';
import {formatEducatorName} from '../helpers/educatorName';

/*
Canonical display of an educator, showing their name as a link to email them.
*/
class Educator extends React.Component {
  render() {
    const {educator, style} = this.props;
    const educatorName = formatEducatorName(educator);

    return (
      <a
        className="Educator"
        style={style || {}}
        href={'mailto:' + educator.email}>
        {educatorName}
      </a>
    );
  }

}

Educator.propTypes = {
  educator: PropTypes.shape({
    full_name: PropTypes.string, // or null
    email: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};

export default Educator;
