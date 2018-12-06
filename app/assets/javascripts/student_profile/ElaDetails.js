import React from 'react';
import PropTypes from 'prop-types';
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
    return (
      <div className="ElaDetails">
        {!hideStar && this.renderStarReading()}
        {this.renderMCASELANextGenScores()}
        {this.renderMCASELAScores()}
        {this.renderMCASELAGrowth()}
      </div>
    );
  }

  renderStarReading() {
    const {chartData, studentGrade} = this.props;
    return (
      <DetailsSection title="STAR Reading, last 4 years">
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
      <DetailsSection title="MCAS ELA Scores (Next Gen), last 4 years">
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
      <DetailsSection title="MCAS ELA Scores, last 4 years">
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
      <DetailsSection title="MCAS ELA growth percentile (SGP), last 4 years">
        <McasSgpChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }
}

ElaDetails.propTypes = {
  chartData: PropTypes.shape({
    star_series_reading_percentile: PropTypes.array,
    mcas_series_ela_scaled: PropTypes.array,
    next_gen_mcas_ela_scaled: PropTypes.array,
    mcas_series_ela_growth: PropTypes.array
  }).isRequired,
  studentGrade: PropTypes.string.isRequired,
  hideStar: PropTypes.bool
};
