import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import ExperimentalBanner from '../components/ExperimentalBanner';


// Renders ed plan data (504)
export default class EdPlansPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showRaw: false,
      showAll: false
    };
    this.onShowRawClicked = this.onShowRawClicked.bind(this);
    this.onShowMore = this.onShowMore.bind(this);
  }

  onShowRawClicked(e) {
    e.preventDefault();
    this.setState({showRaw: true});
  }

  onShowMore(e) {
    e.preventDefault();
    this.setState({showAll: true});
  }

  render() {
    const {edPlans} = this.props;
    const {showAll, showRaw} = this.state;

    const sortedEdPlans = _.sortBy(edPlans, 'sep_effective_date').reverse();
    const visibleEdPlans = (showAll) ? sortedEdPlans : sortedEdPlans.slice(0, 1);
    return (
      <div className="EdPlansPanel">
        <ExperimentalBanner />
        {visibleEdPlans.map(this.renderEdPlan, this)}
        {showAll
          ? null
          : <a href="#" style={styles.link} onClick={this.onShowMore}>Show older 504 plans</a>
        }
        {showRaw
          ? <pre>{JSON.stringify(edPlans, null, 2)}</pre>
          : <a href="#" style={styles.link} onClick={this.onShowRawClicked}>Show raw data</a>
        }
      </div>
    );
  }

  // Might not be active or effective
  renderEdPlan(edPlan) {
    return (
      <div key={edPlan.id} style={{margin: 10, marginBottom: 40}}>
        <h2>504 plan <span style={{color: '#aaa', paddingLeft: 10}}>id:{edPlan.sep_oid}</span></h2>
        <div style={{margin: 10}}>
          <div style={{paddingTop: 10}}>
            <h6>Status</h6>
            <div>Effective dates {reformatDate(edPlan.sep_effective_date, highlight('(missing)'))} - {reformatDate(edPlan.sep_end_date, highlight('(missing)'))}</div>
            <div>Last review on {reformatDate(edPlan.sep_review_date, highlight('(none)'))}</div>
            <div>Last meeting on {reformatDate(edPlan.sep_last_meeting_date, highlight('(none)'))}</div>
            <div>Last modified on {reformatDate(edPlan.sep_last_modified, highlight('(none)'))}</div>
            <div>{reformatDate(edPlan.sep_parent_signed_date, highlight('Not signed'))} by family</div>
            <div>{reformatDate(edPlan.sep_district_signed_date, highlight('Not signed'))} by district</div>
          </div>
          <div style={{marginTop: 20, paddingTop: 10, borderTop: '1px solid #eee'}}>
            <h6>Document text</h6>
            {this.renderSubstance(edPlan)}
          </div>
          <div style={{marginTop: 20, paddingTop: 10, borderTop: '1px solid #eee'}}>
            <h6>Accommodations</h6>
            {edPlan.ed_plan_accommodations.map(accommodation => (
              <div key={accommodation.id}>{accommodation.iac_description}</div>
            ))}
            {edPlan.ed_plan_accommodations.length === 0 && <div>No accommodations.</div>}
          </div>
        </div>
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
    sep_last_modified: PropTypes.string,
    ed_plan_accommodations: PropTypes.arrayOf(PropTypes.shape({
      iac_content_area: PropTypes.string,
      iac_category: PropTypes.string,
      iac_type: PropTypes.string,
      iac_description: PropTypes.string,
      iac_field: PropTypes.string,
      iac_name: PropTypes.string,
      iac_last_modified: PropTypes.string
    })).isRequired
  })).isRequired
};

const styles = {
  substance: {
    whiteSpace: 'pre-wrap'
  },
  link: {
    display: 'block',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10
  }
};


function reformatDate(maybeDateText, elseValue = null) {
  if (!maybeDateText) return elseValue;
  return toMomentFromRailsDate(maybeDateText).format('M/D/YY');
}

function highlight(el) {
  return <span style={{color: 'orange'}}>{el}</span>;
}
