import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import ts from '../components/tableStyles';
import ExperimentalBanner from '../components/ExperimentalBanner';


// Renders ed plan data
export default class EdPlansPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showRaw: false
    };
    this.onShowRawClicked = this.onShowRawClicked.bind(this);
  }

  onShowRawClicked(e) {
    e.preventDefault();
    this.setState({showRaw: true});
  }

  render() {
    const {edPlans} = this.props;
    const {showRaw} = this.state;
    return (
      <div className="EdPlansPanel">
        <ExperimentalBanner />
        <table style={{...ts.table, margin: 0, width: '100%'}}>
          <thead>
            <tr>
              <th style={ts.headerCell}>Effective dates</th>
              <th style={ts.headerCell}>Reviews</th>
              <th style={ts.headerCell}>Signatures</th>
              <th style={ts.headerCell}>Content</th>
            </tr>
          </thead>
          <tbody>{edPlans.map(edPlan => (
            <tr key={edPlan.sep_oid}>
              <td style={ts.cell}>{reformatDate(edPlan.sep_effective_date)} - {reformatDate(edPlan.sep_end_date)}</td>
              <td style={ts.cell}>
                <div>Last review on {reformatDate(edPlan.sep_review_date, '(none)')}</div>
                <div>Last meeting on {reformatDate(edPlan.sep_last_meeting_date, '(none)')}</div>
                <div>Last modified on {(edPlan.sep_last_modified)
                  ? moment.utc(edPlan.sep_last_modified/1000)
                  : '(none)'}
                </div>
                </td>
              <td style={ts.cell}>
                <div>{reformatDate(edPlan.sep_parent_signed_date, <b style={{color: 'orange'}}>Not signed</b>)} by family</div>
                <div>{reformatDate(edPlan.sep_district_signed_date, <b style={{color: 'orange'}}>Not signed</b>)} by district</div>
              </td>
              <td style={{...ts.cell, ...styles.substance}}>{this.renderSubstance(edPlan)}</td>
            </tr>
          ))}</tbody>
        </table>
        {showRaw
          ? <pre>{JSON.stringify(edPlans, null, 2)}</pre>
          : <a href="#" style={styles.showRaw} onClick={this.onShowRawClicked}>Show raw data</a>
        }
      </div>
    );
  }

  renderSubstance(edPlan) {
    const lines = [
      edPlan.sep_fieldd_001,
      edPlan.sep_fieldd_002,
      edPlan.sep_fieldd_003,
      edPlan.sep_fieldd_004,
      edPlan.sep_fieldd_005,
      edPlan.sep_fieldd_006,
      edPlan.sep_fieldd_007,
      edPlan.sep_fieldd_008,
      edPlan.sep_fieldd_009,
      edPlan.sep_fieldd_010,
      edPlan.sep_fieldd_011,
      edPlan.sep_fieldd_012,
      edPlan.sep_fieldd_013,
      edPlan.sep_fieldd_014
    ];
    const cleanedLines = _.compact(lines.map(field => field === 'N' ? null : field));
    return <div>{cleanedLines.map(line => <div key={line} style={{marginBottom: 20}}>{line}</div>)}</div>;
  }
}
EdPlansPanel.propTypes = {
  edPlans: PropTypes.arrayOf(PropTypes.shape({
    sep_effective_date: PropTypes.string,
    sep_review_date: PropTypes.string,
    sep_last_meeting_date: PropTypes.string,
    sep_district_signed_date: PropTypes.string,
    sep_parent_signed_date: PropTypes.string,
    sep_end_date: PropTypes.string,
    sep_last_modified: PropTypes.number, // ms timestamp
  })).isRequired
};

const styles = {
  substance: {
    whiteSpace: 'pre-wrap'
  },
  showRaw: {
    display: 'inline-block',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20
  }
};


function reformatDate(maybeDateText, elseValue = null) {
  if (!maybeDateText) return elseValue;
  return toMomentFromRailsDate(maybeDateText).format('M/D/YY');
}