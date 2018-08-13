import PropTypes from 'prop-types';
import React from 'react';


/*
React wrapper for jQuery datepicker.  Relies on an asset file being available at a particular path.
*/
const BUTTON_IMAGE_ASSET_PATH = '/datepicker-calendar-icon.svg'; // in public folder

export default class Datepicker extends React.Component {

  constructor(props) {
    super(props);

    this.onDateSelected = this.onDateSelected.bind(this);
    this.onDateChanged = this.onDateChanged.bind(this);
  }

  componentDidMount(props, state) {
    const el = this.el;
    $(el).find('.datepicker').datepicker({
      showOn: "button",
      buttonImage: BUTTON_IMAGE_ASSET_PATH,
      buttonImageOnly: true,
      buttonText: "Select date",
      dateFormat: 'yy-mm-dd',
      minDate: 0,    // intervention end date cannot be earlier than today
      ...this.props.datepickerOptions,
      onSelect: this.onDateSelected
    });
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
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  styles: PropTypes.shape({
    datepicker: PropTypes.object,
    input: PropTypes.object
  }),
  datepickerOptions: PropTypes.object,
  dynamicUpdate: PropTypes.bool
};

Datepicker.defaultProps = {
  styles: {
    datepicker: {},
    input: {}
  },
  dynamicUpdate: false
};
