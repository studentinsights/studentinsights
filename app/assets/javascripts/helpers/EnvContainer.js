import React from 'react';
import PropTypes from 'prop-types';


// Provides Env variables as context.
export default class EnvContainer extends React.Component {
  getChildContext() {
    const {env} = this.props;
    return {env};
  }

  render() {
    const {children} = this.props;

    return children;
  }
}
EnvContainer.childContextTypes = {
  env: PropTypes.shape({
    districtKey: PropTypes.string.isRequired
  })
};
EnvContainer.propTypes = {
  children: PropTypes.node.isRequired,
  env: PropTypes.object.isRequired
};
