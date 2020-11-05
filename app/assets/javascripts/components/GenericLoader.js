import PropTypes from 'prop-types';
import React from 'react';
import PromiseLoader from './PromiseLoader';
import Loading from './Loading';

// Executes a promise, shows generic loading and error
// messages, and calls `render` with the resolved value of the promise.
//
// Example usage:
//
// <GenericLoader
//    promiseFn={fetch('/foos').then(response => response.json())}
//    render={foos => this.renderFoos(foo)} />
export default class GenericLoader extends React.Component {
  constructor(props) {
    super(props);
    this.renderGeneric = this.renderGeneric.bind(this);
  }

  render() {
    const {promiseFn} = this.props;
    return (
      <PromiseLoader promiseFn={promiseFn}>
        {this.renderGeneric}
      </PromiseLoader>
    );
  }

  renderGeneric(promiseState) {
    const {isPending, reject, resolve} = promiseState;
    const {render, style} = this.props;

    if (isPending) return <Loading style={{padding: 10}} />;

    // Throw and provide the original stack trace if a global flag is set for test mode.
    if (reject) {
      if (global.GENERIC_LOADER_THROW_ON_REJECT_IN_TEST) { //eslint-disable-line no-undef
        throw reject;
      } else {
        console.error('GenericLoader rejected:', reject); // eslint-disable-line no-console
      }
      return <div style={{padding: 10, ...style}}>There was an error loading this data.</div>;
    }
    return <div style={style}>{render(resolve)}</div>;
  }
}
GenericLoader.propTypes = {
  promiseFn: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
  style: PropTypes.object
};


// sugars, commonly used with this component
export function Pending() {
  return <span style={{
    width: '8em',
    textAlign: 'center',
    color: '#333',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 10,
    padding: 5}}>...</span>;
}

export function Failure() {
  return <span style={{
    width: '8em',
    textAlign: 'center',
    backgroundColor: 'red',
    color: 'white',
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 5,
    fontWeight: 'bold'
  }}>network error</span>;
}

export const flexVerticalStyle = {
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
};
