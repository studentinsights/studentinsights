(function() {
  window.shared || (window.shared = {});
  const merge = window.shared.ReactHelpers.merge;

  // This component wraps Highcharts so that you can provide Highcharts
  // options as props, and it bridges calling into the library.
  const HighchartsWrapper = window.shared.HighchartsWrapper = React.createClass({
    displayName: 'HighchartsWrapper',

    // direct passthrough to highcharts
    propsTypes: {},

    onRefForChart: function(el) {
      this._chartEl = el;
    },

    componentDidMount: function(props, state) {
      $(this._chartEl).highcharts(this.props);
    },

    componentWillUnmount: function(props, state) { 
      delete this._chartEl;
    },

    render: function() {
      return (
        <div className="HighchartsWrapper">
          <div ref={this.onRefForChart} />
        </div>
      );
    }
  });
})();
