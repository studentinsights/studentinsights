(function() {
  window.shared || (window.shared = {});

  // This component wraps Highcharts so that you can provide Highcharts
  // options as props, and it bridges calling into the library.
  window.shared.HighchartsWrapper = React.createClass({
    displayName: 'HighchartsWrapper',

    componentDidMount: function(props, state) {
      $(this._chartEl).highcharts(this.props);
    },

    componentWillUnmount: function(props, state) {
      delete this._chartEl;
    },

    onRefForChart: function(el) {
      this._chartEl = el;
    },

    render: function() {
      return (
        <div className="HighchartsWrapper">
          <div ref={this.onRefForChart} />
        </div>
      );
    },

  });
})();
