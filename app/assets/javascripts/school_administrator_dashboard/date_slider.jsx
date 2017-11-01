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
      // beginningDate: parseInt(moment.utc("2016-08-01").format("X")),
      // endingDate: parseInt(moment.utc().format("X")),
      value: [parseInt(moment.utc("2016-08-01").format("X")), parseInt(moment.utc().format("X"))]
    };
  },

  onBeginningDateInput: function(date) {
    this.setState({ value: [parseInt(moment.utc(date.target.value).format("X")), this.state.value[1]] });
  },

  onEndingDateInput: function(date) {
    this.setState({ value: [this.state.value[0], parseInt(moment.utc(date.target.value).format("X"))] });
  },

  onSliderChange: function(value) {
    this.setState({value});
  },

  render: function() {
    const startRange = parseInt(moment.utc("2016-08-01").format("X"));
    const endRange = parseInt(moment.utc().format("X"));
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
