// import React from 'react';
// import PropTypes from 'prop-types';


// // Provide an error boundary, reporting to Rollbar if this happens.
// // Requires window.Rollbar.error to be present.
// export default class RollbarErrorBoundary extends React.Component {
//   static getDerivedStateFromError(error, info) {
//     return {error, info};
//   }

//   constructor(props) {
//     super(props);
//     this.state = {
//       error: null,
//       info: null
//     };
//   }

//   componentDidCatch(error, info) {
//     this.rollbarErrorFn('RollbarErrorBoundary#componentDidCatch', {error, info});
//   }

//   rollbarErrorFn(msg, obj = {}) {
//     const rollbarErrorFn = (window.Rollbar && window.Rollbar.error)
//       ? window.Rollbar.error
//       : this.props.rollbarErrorFn;
//     if (rollbarErrorFn) rollbarErrorFn(msg, obj);
//   }
// }
// RollbarErrorBoundary.propTypes = {
//   rollbarErrorFn: PropTypes.func.isRequired
// };