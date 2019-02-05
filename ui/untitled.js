// Provide an error boundary, reporting to Rollbar if this happens.
export default class RollbarErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error, errorInfo) {
    return {error, errorInfo};
  }

  componentDidCatch(error, info) {
    this.rollbarErrorFn('App#componentDidCatch', {error, info});
  }

  rollbarErrorFn(msg, obj = {}) {
    const rollbarErrorFn = (window.Rollbar && window.Rollbar.error)
      ? window.Rollbar.error
      : this.props.rollbarErrorFn;
    console.log('rollbarErrorFn', rollbarErrorFn);
    if (rollbarErrorFn) rollbarErrorFn(msg, obj);
  }
  
