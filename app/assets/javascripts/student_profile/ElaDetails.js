import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromRailsDate} from '../helpers/toMoment';
import {high, medium, low} from '../helpers/colors';
import {Email} from '../components/PublicLinks';
import DetailsSection from './DetailsSection';
import StarChart from './StarChart';
import {McasNextGenChart, McasOldChart, McasSgpChart} from './McasChart';

/*
This renders details about ELA performance and growth in the student profile page.

On charts, we could filter out older values, since they're drawn outside of the visible projection
area, and Highcharts hovers look a little strange because of that.  It shows a bit more
historical context though, so we'll keep all data points, even those outside of the visible
range since interpolation lines will still be visible.
*/
export default class ElaDetails extends React.Component {
  render() {
    const {hideStar} = this.props;
    const els = [
      this.renderReaderProfile(),
      this.renderDibels(),
      this.renderFAndPs(),
      (!hideStar && this.renderStarReading()),
      this.renderMCASELANextGenScores(),
      this.renderMCASELAScores(),
      this.renderMCASELAGrowth()
    ];

    return (
      <div className="ElaDetails">
        {_.compact(els).length > 0 ? els : this.renderNoData()}
      </div>
    );
  }

  renderNoData() {
    return (
      <DetailsSection key="no-data" title="Reading data">
        <div>No data has been synced.</div>
        <div>Please reach out to your district lead or <Email /> if you have ideas for how to improve this!</div>
      </DetailsSection>
    );
  }

  renderReaderProfile() {
    const {readerProfileEl} = this.props;
    if (!readerProfileEl) return null;

    return <div key="reader-profile">{readerProfileEl}</div>;
  }

  renderDibels() {
    const {dibels} = this.props;
    if (dibels.length === 0) return null;
    const latestDibels = _.last(_.sortBy(dibels, 'date_taken'));
    return (
      <DetailsSection key="dibels" title="DIBELS, latest score">
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
      <DetailsSection key="f_and_ps" title="Fountas and Pinnell (F&P), latest score">
        <div>
          <span style={{padding: 5, backgroundColor: '#ccc', fontWeight: 'bold'}}>Level {fAndP.instructional_level}{maybeCode}</span>
          <span> on {toMomentFromRailsDate(fAndP.benchmark_date).format('M/D/YY')}</span>
        </div>
      </DetailsSection>
    );
  }

  renderStarReading() {
    const {chartData, studentGrade} = this.props;
    return (
      <DetailsSection key="star" title="STAR Reading, last 4 years">
        <StarChart
          starSeries={chartData.star_series_reading_percentile}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASELANextGenScores() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.next_gen_mcas_ela_scaled;
    if (!mcasSeries || mcasSeries.length === 0) return null;

    return (
      <DetailsSection key="next-gen-mcas" title="MCAS ELA Scores (Next Gen), last 4 years">
        <McasNextGenChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASELAScores() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.mcas_series_ela_scaled;
    if (!mcasSeries || mcasSeries.length === 0) return null;

    return (
      <DetailsSection key="old-mcas" title="MCAS ELA Scores, last 4 years">
        <McasOldChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASELAGrowth() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.mcas_series_ela_growth;
    if (!mcasSeries || mcasSeries.length === 0) return null;
    
    return (
      <DetailsSection key="mcas-sgp" title="MCAS ELA growth percentile (SGP), last 4 years">
        <McasSgpChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }
}

ElaDetails.propTypes = {
  dibels: PropTypes.array.isRequired,
  fAndPs: PropTypes.array.isRequired,
  chartData: PropTypes.shape({
    star_series_reading_percentile: PropTypes.array,
    mcas_series_ela_scaled: PropTypes.array,
    next_gen_mcas_ela_scaled: PropTypes.array,
    mcas_series_ela_growth: PropTypes.array
  }).isRequired,
  studentGrade: PropTypes.string.isRequired,
  hideStar: PropTypes.bool,
  readerProfileEl: PropTypes.node
};
