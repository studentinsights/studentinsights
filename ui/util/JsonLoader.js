import React, { Component } from 'react';
import PromiseLoader from './PromiseLoader';
import qs from 'query-string';
import _ from 'lodash';


// Fetch JSON, showing default loading and error states, and
// then rendering the child fn when there's data.
class JsonLoader extends Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.onResolved = this.onResolved.bind(this);
    this.onRejected = this.onRejected.bind(this);
  }

  fetchJson() {
    const {path, query, options} = this.props;
    const url = (_.isEmpty(query))
      ? path
      : `${path}?${qs.stringify(query)}`;
    return fetch(url, options).then(r => r.json());
  }

  onResolved(resolve) {
    if (this.props.onLoaded) this.props.onLoaded(resolve);
  }

  onRejected(reject) {
    if (this.props.onError) this.props.onError(reject);
  }

  render() {
    return (
      <PromiseLoader
        promiseFn={this.fetchJson}
        onResolved={this.onResolved}
        onRejected={this.onRejected}>
        {promiseState => this.renderPromiseStates(promiseState)}
      </PromiseLoader>
    );
  }

  renderPromiseStates(promiseState) {
    if (promiseState.isPending) {
      return <div style={styles.message}>Loading...</div>;
    }

    if (promiseState.reject) {
      return <div style={styles.message}>There was an error and developers have been notified so they can fix the issue.  In the meantime, reloading the page might help.</div>;
    }

    return this.renderJson(promiseState.resolve);
  }

  renderJson(json) {
    const {children} = this.props;
    return children(json);
  }
}
JsonLoader.propTypes = {
  path: React.PropTypes.string.isRequired,
  children: React.PropTypes.func.isRequired,
  query: React.PropTypes.object,
  options: React.PropTypes.object,
  onLoaded: React.PropTypes.func,
  onError: React.PropTypes.func
};
JsonLoader.defaultProps = {
  query: {},
  options: {
    credentials: 'include'
  }
};

const styles = {
  message: {
    margin: 20,
    color: '#333'
  }
};

export default JsonLoader;