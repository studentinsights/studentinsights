import React from 'react';
import PropTypes from 'prop-types';


// A container that provides `districtKey`, assumed to be static across
// the lifetime of all JS execution.  For React components, use this instead of
// `readEnv`, which is intended for bootstrap code.
export default class PerDistrictContainer extends React.Component {
  getChildContext() {
    const {districtKey} = this.props;
    return {districtKey};
  }

  render() {
    const {children} = this.props;
    return children;
  }
}
PerDistrictContainer.childContextTypes = {
  districtKey: PropTypes.string
};
PerDistrictContainer.propTypes = {
  districtKey: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};
