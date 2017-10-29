import React from 'react';


function promiseState() {
  return {
    isPending: true,
    resolve: undefined,
    reject: undefined
  };
}

// Executes a promise, passes state changes to children.
class PromiseLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataP: promiseState()
    };
    this.onResolved = this.onResolved.bind(this);
    this.onRejected = this.onRejected.bind(this);
  }

  componentDidMount() {
    const {promiseFn} = this.props;
    promiseFn()
      .then(this.onResolved)
      .then(this.onRejected);
  }

  onResolved(resolve) {
    const {dataP} = this.state;
    this.setState({ dataP: {...dataP, resolve, isPending: false} });
    if (this.props.onResolved) this.props.onResolved(resolve);
  }

  onRejected(reject) {
    const {dataP} = this.state;
    this.setState({ dataP: {...dataP, reject, isPending: false} });
    if (this.props.onRejected) this.props.onRejected(reject);
  }

  render() {
    const {dataP} = this.state;
    const {children} = this.props;

    return children(dataP);
  }
}
PromiseLoader.propTypes = {
  promiseFn: React.PropTypes.func.isRequired,
  children: React.PropTypes.func.isRequired,
  onResolved: React.PropTypes.func,
  onRejected: React.PropTypes.func
};

export default PromiseLoader;