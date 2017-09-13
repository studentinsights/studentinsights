(function () {
  window.shared || (window.shared = {});

  // This component wraps Highcharts so that you can provide Highcharts
  // options as props, and it bridges calling into the library.
  window.shared.HighchartsWrapper = React.createClass({
    displayName: 'HighchartsWrapper',

    componentDidMount(props, state) {
      $(this._chartEl).highcharts(this.props);
    },

    componentWillUnmount(props, state) {
      delete this._chartEl;
    },

    onRefForChart(el) {
      this._chartEl = el;
    },

    render() {
      return (
        <div className="HighchartsWrapper">
          <div ref={this.onRefForChart} />
        </div>
      );
    },

  });
}());
