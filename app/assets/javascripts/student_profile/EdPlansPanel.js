import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromRailsDate} from '../helpers/toMoment';


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
        {visibleEdPlans.map(this.renderEdPlan, this)}
        {showAll || edPlans.length <= 1
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
    const {studentName} = this.props;

    return (
      <div key={edPlan.id} style={{marginBottom: 40, padding: 20, border: '1px solid #ccc', backgroundColor: '#f8f8f8'}}>
        <h2 style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <div>504 plan for {studentName}</div>
          <div style={{color: '#ccc', paddingLeft: 10}}>id:{edPlan.sep_oid}</div>
        </h2>
        <div>
          <div style={{paddingTop: 10}}>
            <div>Specific disability: {edPlan.sep_fieldd_006}</div>
            <div>Date of implementation: {reformatDate(edPlan.sep_effective_date)}</div>
            <div>End date: {reformatDate(edPlan.sep_end_date, '(none)')}</div>
            <div>Review date: {reformatDate(edPlan.sep_review_date, '(none)')}</div>
          </div>
          {this.renderSubstanceIfPresent(edPlan)}
          <div style={styles.section}>
            <h6>Persons responsible</h6>
            {reformatPersons(edPlan.sep_fieldd_007, 'None listed.')}
          </div>
          <div style={styles.section}>
            <h6>Accommodations</h6>
            {this.renderAccommodationsList(edPlan)}
          </div>
        </div>
      </div>
    );
  }

  renderSubstanceIfPresent(edPlan) {
    const lines = [
      edPlan.sep_fieldd_001,
      edPlan.sep_fieldd_002,
      edPlan.sep_fieldd_003,
      edPlan.sep_fieldd_004,
      edPlan.sep_fieldd_005,
      // not 6 or 7
      edPlan.sep_fieldd_008,
      edPlan.sep_fieldd_009,
      edPlan.sep_fieldd_010,
      edPlan.sep_fieldd_011,
      edPlan.sep_fieldd_012,
      edPlan.sep_fieldd_013,
      edPlan.sep_fieldd_014
    ];
    const cleanedLines = _.compact(lines.map(field => field === 'N' ? null : field));
    if (cleanedLines.length === 0 || cleanedLines.join('') === '') return null;

    return (
      <div style={styles.section}>
        {cleanedLines.map(line => <div key={line} style={{marginBottom: 10}}>{line}</div>)}
      </div>
    );
  }

  renderAccommodationsList(edPlan) {
    if (edPlan.ed_plan_accommodations.length === 0) return <div>None listed.</div>;

    const filteredAccommodations = edPlan.ed_plan_accommodations.filter(accommodation => {
      return (accommodation.iac_description !== '');
    });
    return (
      <ul style={styles.simpleList}>
        {filteredAccommodations.map(accommodation => {
          const whomEl = accommodation.iac_field
            ? ` (${accommodation.iac_field})`
            : null;
          return <li key={accommodation.id}>{accommodation.iac_description}{whomEl}</li>;
        })}
      </ul>
    );      
  }
}
EdPlansPanel.propTypes = {
  studentName: PropTypes.string.isRequired,
  edPlans: PropTypes.arrayOf(PropTypes.shape({
    sep_effective_date: PropTypes.string.isRequired,
    sep_review_date: PropTypes.string,
    sep_end_date: PropTypes.string,
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
  section: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1px solid #ccc'
  },
  simpleList: {
    paddingLeft: 15
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
  return toMomentFromRailsDate(maybeDateText).format('M/D/YYYY');
}

function reformatPersons(personsText, elseValue = null) {
  if (!personsText || personsText === '') return elseValue;
  return (
    <ul style={{...styles.simpleList, listStyleType: 'circle'}}>
      {personsText.split(/[,;]\s/).map(personText => (
        <li key={personText}>{personText}</li>
      ))}
    </ul>
  );
}
