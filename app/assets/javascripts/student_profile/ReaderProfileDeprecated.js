import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import DetailsSection from './DetailsSection';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {high, medium, low} from '../helpers/colors';


// This is deprecated
// Subsequent interations include ReaderProfileJune and ReaderProfileJanuary.
export default class ReaderProfileDeprecated extends React.Component {
  render() {
    return (
      <div className="ReaderProfileDeprecated">
        {this.renderDibels()}
        {this.renderFAndPs()}
      </div>
    );
  } 

  renderDibels() {
    const {dibels} = this.props;
    if (dibels.length === 0) return null;
    const latestDibels = _.last(_.sortBy(dibels, 'date_taken'));
    return (
      <DetailsSection key="dibels" title="DIBELS, older data">
        <div>{this.renderDibelsScore(latestDibels.benchmark)} on {toMomentFromRailsDate(latestDibels.date_taken).format('M/D/YY')}</div>
      </DetailsSection>
    );
  }

  renderDibelsScore(score) {
    const backgroundColor = {
      'INTENSIVE': low,
      'STRATEGIC': medium,
      'CORE': high
    }[score] || '#ccc';
    return <span style={{padding: 5, opacity: 0.85, fontWeight: 'bold', color: 'white', backgroundColor}}>{score}</span>;
  }

  renderFAndPs() {
    const {fAndPs} = this.props;
    if (fAndPs.length === 0) return null;
    const fAndP = _.last(_.sortBy(fAndPs, 'benchmark_date'));
    const maybeCode = (fAndP.f_and_p_code) ? ` with ${fAndP.f_and_p_code} code` : null;
    
    return (
      <DetailsSection key="f_and_ps" title="Fountas and Pinnell (F&P), older data">
        <div>
          <span style={{padding: 5, backgroundColor: '#ccc', fontWeight: 'bold'}}>Level {fAndP.instructional_level}{maybeCode}</span>
          <span> on {toMomentFromRailsDate(fAndP.benchmark_date).format('M/D/YY')}</span>
        </div>
      </DetailsSection>
    );
  }
}
ReaderProfileDeprecated.propTypes = {
  dibels: PropTypes.array.isRequired,
  fAndPs: PropTypes.array.isRequired
};
