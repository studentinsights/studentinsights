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

  render: function() {
    const startRange = parseInt(moment.utc("2016-08-01").format("X"));
    const endRange = parseInt(moment.utc().format("X"));
    return (
      <div style={style}>
      <p>Date Range</p>
        <Range
          allowCross={false}
          min={startRange}
          max={endRange}
          defaultValue={[startRange, endRange]}
          tipFormatter={(value) => moment.unix(value).format("YYYY-MM-DD")}
          onAfterChange={this.props.setDate}/>
      </div>
    );
  }

});
