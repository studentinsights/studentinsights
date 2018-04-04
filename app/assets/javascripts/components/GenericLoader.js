import React from 'react';
import PromiseLoader from './PromiseLoader';


// Executes a promise, shows generic loading and error
// messages, and calls `render` with the resolved value of the promise.
//
// Example usage:
//
// <GenericLoader
//    promiseFn={fetch('/foos').then(response => response.json())}
//    render={foos => this.renderFoos(foo)} />
class GenericLoader extends React.Component {
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

    if (isPending) return <div style={{padding: 10, ...style}}>Loading...</div>;

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
  promiseFn: React.PropTypes.func.isRequired,
  render: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};

export default GenericLoader;