import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import Datepicker from '../../student_profile/Datepicker.js';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);

class DateSlider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: [this.props.rangeStart, this.props.rangeEnd]};
    this.onBeginningDateInput = (date) => {
      const newValue = [parseInt(moment(date).format("X")), this.state.value[1]];
      this.setState({ value: newValue }, this.props.setDate(newValue));
    };
    this.onEndingDateInput = (date) => {
      const newValue = [this.state.value[0], parseInt(moment(date).format("X"))];
      this.setState({ value: newValue }, this.props.setDate(newValue));
    };
    this.onSliderChange = (value) => {
      this.setState({value});
    };
  }

  render() {
    return (
      <div>
        <div className='DashboardDatePicker'>
          <div>
            <label>From date:</label>
            <Datepicker
              styles={{
                input: {
                  fontSize: 12
                }
              }}
              value={moment.unix(this.state.value[0]).format("YYYY-MM-DD")}
              onChange={this.onBeginningDateInput}
              datepickerOptions={{
                showOn: 'both',
                dateFormat: 'yy-mm-dd',
                minDate: moment.unix(this.props.rangeStart).format("YYYY-MM-DD"),
                maxDate: moment.unix(this.state.value[1]).format("YYYY-MM-DD")
              }} />
          </div>
          <div>
            <label>To date:</label>
            <Datepicker
              styles={{
                input: {
                  fontSize: 12
                }
              }}
              value={moment.unix(this.state.value[1]).format("YYYY-MM-DD")}
              onChange={this.onEndingDateInput}
              datepickerOptions={{
                showOn: 'both',
                dateFormat: 'yy-mm-dd',
                minDate: moment.unix(this.state.value[0]).format("YYYY-MM-DD"),
                maxDate: moment.unix(this.props.rangeEnd).format("YYYY-MM-DD")
              }}
              dynamicUpdate={true} />
          </div>
        </div>
        <Range
          allowCross={false}
          min = {this.props.rangeStart}
          max = {this.props.rangeEnd}
          defaultValue = {[this.props.rangeStart, this.props.rangeEnd]}
          value = {this.state.value}
          onChange = {this.onSliderChange}
          tipFormatter={(value) => moment.unix(value).format("MM-DD-YYYY")}
          onAfterChange={this.props.setDate}/>
        </div>
    );
  }
}

DateSlider.propTypes = {
  setDate: PropTypes.func.isRequired,
  rangeStart: PropTypes.number.isRequired,
  rangeEnd: PropTypes.number.isRequired
};

export default DateSlider;
