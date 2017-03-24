(function() {
  window.shared || (window.shared = {});
  const dom = window.shared.ReactHelpers.dom;
  const createEl = window.shared.ReactHelpers.createEl;
  const merge = window.shared.ReactHelpers.merge;

  // This must be read lazily, since these options require the DOM
  // to be ready and some specific HTML to be on the page.
  const datepickerOptionsFn = function() { return window.datepicker_options || {}; };

  const styles = {
    datepicker: {},
    input: {}
  };

  /*
  React wrapper for jQuery datepicker.
  */
  const Datepicker = window.shared.Datepicker = React.createClass({
    displayName: 'Datepicker',

    propTypes: {
      value: React.PropTypes.string,
      onChange: React.PropTypes.func.isRequired,
      styles: React.PropTypes.shape({
        datepicker: React.PropTypes.object,
        input: React.PropTypes.object
      }),
      datepickerOptions: React.PropTypes.object
    },

    getDefaultProps: function() {
      return {
        styles: styles
      };
    },

    componentDidMount: function(props, state) {
      const datepickerOptions = merge(datepickerOptionsFn(), this.props.datepickerOptions);
      const el = ReactDOM.findDOMNode(this);
      $(el).find('.datepicker').datepicker(merge(datepickerOptions, {
        onSelect: this.onDateSelected
      }));
    },

    // Datepicker suppresses DOM change events,
    // see http://api.jqueryui.com/datepicker/
    onDateSelected: function(dateText) {
      this.props.onChange(dateText);
    },

    onDateChanged: function(e) {
      this.props.onChange(e.target.value);
    },

    render: function() {
      return (
        <div className="Datepicker" style={this.props.styles.datepicker}>
          <input
            className="datepicker"
            style={this.props.styles.input}
            onChange={this.onDateChanged}
            value={this.props.value} />
        </div>
      );
    }
  });
})();
