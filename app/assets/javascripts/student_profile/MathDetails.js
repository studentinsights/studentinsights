import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {merge} from '../helpers/merge';
import ProfileChart from './ProfileChart';
import ProfileChartSettings from './ProfileChartSettings';
import DetailsSection from './DetailsSection';


/*
This renders details about math performance and growth in the student profile page.
It's mostly historical charts.

On charts, we could filter out older values, since they're drawn outside of the visible projection
area, and Highcharts hovers look a little strange because of that.  It shows a bit more
historical context though, so we'll keep all data points, even those outside of the visible
range since interpolation lines will still be visible.
*/

export default class MathDetails extends React.Component {

  // TODO(er) factor out
  percentileYAxis() {
    return merge(ProfileChartSettings.percentile_yaxis, {
      plotLines: [{
        color: '#666',
        width: 1,
        zIndex: 3,
        value: 50,
        label: {
          text: '50th percentile',
          align: 'center',
          style: {
            color: '#999999'
          }
        }
      }]
    });
  }

  render() {
    const {hideStar} = this.props;
    return (
      <div className="MathDetails">
        {this.renderNavBar()}
        {!hideStar && this.renderStarMath()}
        {this.renderMCASMathNextGenScores()}
        {this.renderMCASMathScores()}
        {this.renderMCASMathGrowth()}
      </div>
    );
  }

  renderMCASNextGenLink() {
    const data = this.props.chartData.next_gen_mcas_mathematics_scaled;

    if (!data || data.length === 0) return null;

    return (
      <span>
        <a style={styles.navBar} href="#MCASMathNextGen">
          MCAS Next Gen Math Chart
        </a>
        {' | '}
      </span>
    );
  }

  renderMCASLink() {
    const data = this.props.chartData.mcas_series_math_scaled;

    if (!data || data.length === 0) return null;

    return (
      <span>
        <a style={styles.navBar} href="#MCASMath">
          MCAS Math Chart
        </a>
        {' | '}
      </span>
    );
  }

  renderNavBar() {
    const {hideNavbar, hideStar} = this.props;
    if (hideNavbar) return null;

    return (
      <div style={styles.navBar}>
        {!hideStar && <a style={styles.navBar} href="#starMath"> STAR Math Chart </a>}
        {!hideStar && ' | '}
        {this.renderMCASNextGenLink()}
        {this.renderMCASLink()}
        <a style={styles.navBar} href="#MCASMathGrowth">MCAS Math SGPss</a>
      </div>
    );
  }

  renderStarMath() {
    const {chartData} = this.props;

    // HighCharts wants time series data sorted in ascending order by time:
    const starMathPercentile = _.clone(chartData.star_series_math_percentile).reverse();

    return (
      <DetailsSection anchorId="starMath" title="STAR Math, last 4 years">
        <ProfileChart
          quadSeries={[{ name: 'Percentile rank', data: starMathPercentile }]}
          titleText="STAR Math, last 4 years"
          student={this.props.student}
          yAxis={merge(this.percentileYAxis(), {
            title: { text: 'Percentile rank' }
          })}
          showGradeLevelEquivalent= { true }/>
      </DetailsSection>
    );
  }

  renderMCASMathNextGenScores() {
    const data = this.props.chartData.next_gen_mcas_mathematics_scaled;

    if (!data || data.length === 0) return null;

    return (
      <DetailsSection anchorId="MCASMathNextGen" title="MCAS Next Gen Math Scores">
        <ProfileChart
          quadSeries={[{
            name: 'Scaled score',
            data: data
          }]}
          titleText='"Next Generation" MCAS Math Scores'
          student={this.props.student}
          yAxis={merge(ProfileChartSettings.default_mcas_score_yaxis,{
            min: 400,
            max: 600,
            plotLines: ProfileChartSettings.mcas_next_gen_level_bands,
            title: { text: 'Scaled score' }
          })} />
      </DetailsSection>
    );
  }

  renderMCASMathScores() {
    const data = this.props.chartData.mcas_series_math_scaled;

    if (!data || data.length === 0) return null;

    return (
      <DetailsSection anchorId="MCASMath" title="MCAS Math Scores, last 4 years">
        <ProfileChart
          quadSeries={[{
            name: 'Scaled score',
            data: data
          }]}
          titleText="MCAS Math Scores, last 4 years"
          student={this.props.student}
          yAxis={merge(ProfileChartSettings.default_mcas_score_yaxis,{
            plotLines: ProfileChartSettings.mcas_level_bands,
            title: { text: 'Scaled score' }
          })} />
      </DetailsSection>
    );
  }

  renderMCASMathGrowth() {
    const data = this.props.chartData.mcas_series_math_growth;
    if (!data || data.length === 0) return null;

    return (
      <DetailsSection anchorId="MCASMathGrowth" title="MCAS Math SGPs, last 4 years">
        <ProfileChart
          quadSeries={[{
            name: 'Student growth percentile (SGP)',
            data: this.props.chartData.mcas_series_math_growth
          }]}
          titleText="MCAS Math SGPs, last 4 years"
          student={this.props.student}
          yAxis={merge(this.percentileYAxis(), {
            title: { text: 'Student growth percentile (SGP)' }
          })} />
      </DetailsSection>
    );
  }

}

MathDetails.propTypes = {
  chartData: PropTypes.shape({
    star_series_math_percentile: PropTypes.array.isRequired,
    mcas_series_math_scaled: PropTypes.array,
    next_gen_mcas_mathematics_scaled: PropTypes.array,
    mcas_series_math_growth: PropTypes.array.isRequired
  }).isRequired,
  student: PropTypes.object.isRequired,
  hideNavbar: PropTypes.bool,
  hideStar: PropTypes.bool
};

const styles = {
  navBar: {
    fontSize: 18
  }
};