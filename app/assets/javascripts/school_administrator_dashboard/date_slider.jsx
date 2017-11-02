import React from 'react';
import Slider from 'rc-slider';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const style = {width: 'auto', margin: 20};

export default React.createClass({
  displayName: 'DateSlider',

  propTypes: {
    setDate: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      value: [parseInt(moment("2016-08-01").format("X")), parseInt(moment().format("X"))]
    };
  },

  onBeginningDateInput: function(date) {
    const newValue = [parseInt(moment(date.target.value).format("X")), this.state.value[1]];
    this.setState({ value: newValue }, this.props.setDate(newValue));
  },

  onEndingDateInput: function(date) {
    const newValue = [this.state.value[0], parseInt(moment(date.target.value).format("X"))];
    this.setState({ value: newValue }, this.props.setDate(newValue));
  },

  onSliderChange: function(value) {
    this.setState({value});
  },

  render: function() {
    const startRange = parseInt(moment("2016-08-01").format("X"));
    const endRange = parseInt(moment().format("X"));
    return (
      <div style={style}>
        <input style={{marginBottom: '5px'}} type="date" value={moment.unix(this.state.value[0]).format("YYYY-MM-DD")} onChange={this.onBeginningDateInput} />
        <input type="date" value={moment.unix(this.state.value[1]).format("YYYY-MM-DD")} onChange={this.onEndingDateInput} />
        <Range
          allowCross={false}
          min = {startRange}
          max = {endRange}
          defaultValue = {[startRange, endRange]}
          value = {this.state.value}
          onChange = {this.onSliderChange}
          tipFormatter={(value) => moment.unix(value).format("MM-DD-YYYY")}
          onAfterChange={this.props.setDate}/>
      </div>
    );
  }

});
