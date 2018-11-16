// import React from 'react';
// import PropTypes from 'prop-types';


// // Debouncer rendering of child components with a timer
// // Adapted from https://github.com/chrisshiplet/react-delay
// export default class Debouncer extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       waiting: true
//     };
//     this.wait = this.wait.bind(this);
//     this.onDelayDone = this.onDelayDone.bind(this);
//   }

//   componentDidMount() {
//     console.log('componentDidMount');
//     this.wait();
//   }

//   componentWillReceiveProps() {
//     console.log('componentWillReceiveProps');
//     this.wait();
//   }

//   componentWillUnmount() {
//     console.log('componentWillUnmount');
//     clearTimeout(this.timer);
//   }

//   wait() {
//     clearTimeout(this.timer);
//     this.timer = setTimeout(this.onDelayDone, this.props.wait);
//   }

//   onDelayDone() {
//     const {onDone} = this.props;
//     this.setState({ waiting: false }, () => {
//       if (onDone) onDone();
//     });
//   }

//   render() {
//     const {renderFn, placeholder} = this.props;
//     const {waiting} = this.state;
//     if (!waiting) {
//       return renderFn();
//     }

//     return placeholder;
//   }
// }

// Debouncer.propTypes = {
//   renderFn: PropTypes.func.isRequired,
//   wait: PropTypes.number.isRequired,
//   placeholder: PropTypes.node,
//   onDone: PropTypes.func
// };

// Debouncer.defaultProps = {
//   wait: 250,
//   placeholder: null
// };
