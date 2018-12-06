import React from 'react';
import PropTypes from 'prop-types';
import DetailsSection from './DetailsSection';
import StarChart from './StarChart';
import {McasNextGenChart, McasOldChart, McasSgpChart} from './McasChart';

/*
This renders details about math performance and growth in the student profile page.
It's mostly historical charts.

On charts, we could filter out older values, since they're drawn outside of the visible projection
area, and Highcharts hovers look a little strange because of that.  It shows a bit more
historical context though, so we'll keep all data points, even those outside of the visible
range since interpolation lines will still be visible.
*/

export default class MathDetails extends React.Component {
  render() {
    const {hideStar} = this.props;
    return (
      <div className="MathDetails">
        {!hideStar && this.renderStarMath()}
        {this.renderMCASMathNextGenScores()}
        {this.renderMCASMathScores()}
        {this.renderMCASMathGrowth()}
      </div>
    );
  }

  renderStarMath() {
    const {chartData, studentGrade} = this.props;
    return (
      <DetailsSection title="STAR Math, last 4 years">
        <StarChart
          starSeries={chartData.star_series_math_percentile}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASMathNextGenScores() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.next_gen_mcas_mathematics_scaled;
    if (!mcasSeries || mcasSeries.length === 0) return null;

    return (
      <DetailsSection title="MCAS Next Gen Math Scores">
        <McasNextGenChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASMathScores() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.mcas_series_math_scaled;
    if (!mcasSeries || mcasSeries.length === 0) return null;

    return (
      <DetailsSection title="MCAS Math Scores, last 4 years">
        <McasOldChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }

  renderMCASMathGrowth() {
    const {chartData, studentGrade} = this.props;
    const mcasSeries = chartData.mcas_series_math_growth;
    if (!mcasSeries || mcasSeries.length === 0) return null;

    return (
      <DetailsSection title="MCAS Math SGPs, last 4 years">
        <McasSgpChart
          mcasSeries={mcasSeries}
          studentGrade={studentGrade}
        />
      </DetailsSection>
    );
  }
}

MathDetails.propTypes = {
  chartData: PropTypes.shape({
    star_series_math_percentile: PropTypes.array,
    mcas_series_math_scaled: PropTypes.array,
    next_gen_mcas_mathematics_scaled: PropTypes.array,
    mcas_series_math_growth: PropTypes.array
  }).isRequired,
  studentGrade: PropTypes.string.isRequired,
  hideStar: PropTypes.bool
};
