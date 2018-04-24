import React from 'react';


function initialPromiseState() {
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
      promiseData: initialPromiseState()
    };
    this.onResolved = this.onResolved.bind(this);
    this.onRejected = this.onRejected.bind(this);
  }

  componentDidMount() {
    const {promiseFn} = this.props;
    promiseFn()
      .then(this.onResolved)
      .catch(this.onRejected);
  }

  onResolved(resolve) {
    const {onResolved} = this.props;
    if (onResolved) onResolved(resolve);

    const {promiseData} = this.state;
    this.setState({ promiseData: {
      ...promiseData,
      isPending: false,
      resolve
    }});
  }

  onRejected(reject) {
    const {promiseData} = this.state;
    this.setState({ promiseData: {
      ...promiseData,
      isPending:false,
      reject
    }});
  }

  render() {
    const {promiseData} = this.state;
    const {children} = this.props;

    return children(promiseData);
  }
}
PromiseLoader.propTypes = {
  promiseFn: React.PropTypes.func.isRequired,
  children: React.PropTypes.func.isRequired,
  onResolved: React.PropTypes.func
};

export default PromiseLoader;