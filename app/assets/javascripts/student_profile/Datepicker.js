import {merge} from '../helpers/react_helpers.jsx';
import React from 'react';

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

class Datepicker extends React.Component {

  constructor(props) {
    super(props);

    this.onDateSelected = this.onDateSelected.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
  }

  componentDidMount(props, state) {
    const datepickerOptions = merge(datepickerOptionsFn(), this.props.datepickerOptions);
    const el = this.el;
    $(el).find('.datepicker').datepicker(merge(datepickerOptions, {
      onSelect: this.onDateSelected
    }));
  }

  //This allows us to set the min and max dates dynamically to prevent selecting
  //start dates later than end dates and vice versa
  componentWillReceiveProps(newProps) {
    if (!this.props.dynamicUpdate) return;

    const el = this.el;
    $(el).find('.datepicker').datepicker("option", newProps.datepickerOptions);
  }

  // Datepicker suppresses DOM change events,
  // see http://api.jqueryui.com/datepicker/
  onDateSelected(dateText) {
    this.props.onChange(dateText);
  }

  onDateChanged(e) {
    this.props.onChange(e.target.value);
  }

  render() {
    return (
      <div
        ref={el => this.el = el}
        className="Datepicker"
        style={this.props.styles.datepicker}>
        <input
          className="datepicker"
          style={this.props.styles.input}
          onChange={this.onDateChanged}
          value={this.props.value} />
      </div>
    );
  }

}

Datepicker.propTypes = {
  value: React.PropTypes.string,
  onChange: React.PropTypes.func.isRequired,
  styles: React.PropTypes.shape({
    datepicker: React.PropTypes.object,
    input: React.PropTypes.object
  }),
  datepickerOptions: React.PropTypes.object,
  dynamicUpdate: React.PropTypes.bool
};

Datepicker.defaultProps = {
  styles: styles,
  dynamicUpdate: false
};

export default Datepicker;
