import React from 'react';
import PropTypes from 'prop-types';
import Card from '../components/Card';

// If it's the benchmark assessment window, show the dialog box.
export default class ReadingDataEntryBox extends React.Component {
  constructor(props) {
    super(props);
    this.fetchJson = this.fetchJson.bind(this);
    this.renderJson = this.renderJson.bind(this);
  }

  fetchJson() {
    const url = `/api/reading/reading_benchmark_entry_box_json`;
    return apiFetchJson(url);
  }

  render() {
    return (
      <div className="ReadingDataEntryBox" style={styles.root}>
        <GenericLoader
          style={styles.card}
          promiseFn={this.fetchJson}
          render={this.renderJson} />
      </div>
    );
  }

  // This has to support multiple grades (for reading specialists), 
  // so: link to completion page if multiple, or link direct if just one.
  /*
  1) don't show
  2) show, link directly to (school, grade, period)
  3) show, link to coverage page for (period)
  */
  renderJson(json) {
    const {style, titleStyle} = this.props;
    const educatorLabels = json.educator_labels;
    const benchmarkPeriodKey = json.benchmark_period_key;
    const directEntryParams = json.direct_entry_params;
    
    return (
      <div style={style}>
        <div style={titleStyle}>Reading benchmarks: {benchmarkPeriodKey}</div>
        <Card style={{border: 'none'}}>
          <div>It's benchmark reading time!</div>
          <div>{Enter your grade's data <a href="/schools/hea/reading/3/entry">here</a>, or read more <a href="#">here</a>.</div>
        </Card>
      </div>
    );
  }
}
ReadingDataEntryBox.propTypes = {
  style: PropTypes.object,
  titleStyle: PropTypes.object
};