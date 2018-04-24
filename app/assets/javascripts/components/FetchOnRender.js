import React from 'react';
import GenericLoader from './GenericLoader';


// Executes a promise, shows generic loading and error
// messages, calls `onResolved` so the caller can setState on its own.
// Then calls `render` when the promise is resolved.
//
// Use this instead of `GenericLoader` when you want to own the state
// in the calling component, rather than having it threaded through to child
// components in `render`.
//
// Example usage:
//
// <FetchOnRender
//   promiseFn={fetch('/foos').then(response => response.json())}
//   onResolved={(json) => this.setState({foos: json.all_the_foos})}
//   render={() => <div>{this.state.foos.length} foos</div>} />
function FetchOnRender({promiseFn, onResolved, render, style = {}}) {
  return (
    <GenericLoader
      promiseFn={promiseFn}
      onResolved={onResolved}
      style={style}
      render={render} />
  );
}
FetchOnRender.propTypes = {
  promiseFn: React.PropTypes.func.isRequired,
  render: React.PropTypes.func.isRequired,
  onResolved: React.PropTypes.func.isRequired,
  style: React.PropTypes.object
};

export default FetchOnRender;