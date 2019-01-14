import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card';

// If it's the benchmark assessment window, show the dialog box.
export default function ReadingDataEntryBox(props) {
  const {educatorLabels, style, titleStyle} = props;  
  if (educatorLabels.indexOf('enable_reading_benchmark_data_entry') === -1) return null;
  
  const benchmarkPeriodText = 'Winter 2018';
  const url = `/schools/hea/reading/3/entry`;
  return (
    <div style={style}>
      <div style={titleStyle}>Reading benchmarks: {benchmarkPeriodText}</div>
      <Card style={{border: 'none'}}>
        <div>Add <a style={{fontWeight: 'bold'}} href={url}>benchmark reading data</a> for your students, and you'll be able to use new tools for making reading groups and visualizing student growth over time.</div>
      </Card>
    </div>
  );
}
ReadingDataEntryBox.propTypes = {
  educatorLabels: PropTypes.arrayOf(PropTypes.string).isRequired,
  style: PropTypes.object,
  titleStyle: PropTypes.object
};