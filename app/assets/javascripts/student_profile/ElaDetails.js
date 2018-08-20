import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {merge} from '../helpers/merge';
import ProfileChart from './ProfileChart';
import ProfileChartSettings from './ProfileChartSettings';
import DetailsSection from './DetailsSection';

/*
This renders details about ELA performance and growth in the student profile page.
It's mostly historical charts.

On charts, we could filter out older values, since they're drawn outside of the visible projection
area, and Highcharts hovers look a little strange because of that.  It shows a bit more
historical context though, so we'll keep all data points, even those outside of the visible
range since interpolation lines will still be visible.
*/
export default class ElaDetails extends React.Component {

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
      <div className="ElaDetails">
        {this.renderNavBar()}
        {!hideStar && this.renderStarReading()}
        {this.renderMCASELANextGenScores()}
        {this.renderMCASELAScores()}
        {this.renderMCASELAGrowth()}
      </div>
    );
  }

  renderMCASNextGenLink() {
    const data = this.props.chartData.next_gen_mcas_ela_scaled;

    if (!data || data.length === 0) return null;
    return (
      <span>
        <a style={styles.navBar} href="#NextGenScores">
          MCAS Next Gen ELA Scores Chart
        </a>
        {' | '}
      </span>
    );

  }

  renderMCASLink() {
    const data = this.props.chartData.mcas_series_ela_scaled;

    if (!data || data.length === 0) return null;

    return (
      <span>
        <a style={styles.navBar} href="#Scores">
          MCAS ELA Scores Chart
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
        {!hideStar && <a style={styles.navBar} href="#Star"> STAR Reading Chart </a>}
        {!hideStar && ' | '}
        {this.renderMCASNextGenLink()}
        {this.renderMCASLink()}
        <a style={styles.navBar} href="#SGPs"> MCAS ELA SGPs Chart</a>
      </div>
    );
  }

  renderStarReading() {
    const {chartData} = this.props;

    // HighCharts wants time series data sorted in ascending order by time:
    const starReading = _.clone(chartData.star_series_reading_percentile).reverse();

    return (
      <DetailsSection anchorId="Star" title="STAR Reading, last 4 years">
        <ProfileChart
          quadSeries={[{ name: 'Percentile rank', data: starReading }]}
          titleText=''
          student={this.props.student}
          yAxis={merge(this.percentileYAxis(), {
            title: { text: 'Percentile rank' }
          })}
          showGradeLevelEquivalent= { true }/>
      </DetailsSection>
    );
  }

  renderMCASELANextGenScores() {
    const data = this.props.chartData.next_gen_mcas_ela_scaled;

    if (!data || data.length === 0) return null;

    return (
      <DetailsSection anchorId="NextGenScores" title="MCAS Next Gen ELA Scores, last 4 years">
        <ProfileChart
          quadSeries={[{
            name: 'Scaled score',
            data: data
          }]}
          titleText=""
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

  renderMCASELAScores() {
    const data = this.props.chartData.mcas_series_ela_scaled;

    if (!data || data.length === 0) return null;

    return (
      <DetailsSection anchorId="Scores" title="MCAS ELA Scores, last 4 years">
        <ProfileChart
          quadSeries={[{
            name: 'Scaled score',
            data: data
          }]}
          titleText=""
          student={this.props.student}
          yAxis={merge(ProfileChartSettings.default_mcas_score_yaxis,{
            plotLines: ProfileChartSettings.mcas_level_bands,
            title: { text: 'Scaled score' }
          })} />
      </DetailsSection>
    );
  }

  renderMCASELAGrowth() {
    return (
      <DetailsSection anchorId="SGPs" title="Student growth percentile (SGP), last 4 years">
        <ProfileChart
          quadSeries={[{
            name: '',
            data: this.props.chartData.mcas_series_ela_growth
          }]}
          titleText="MCAS ELA SGPs, last 4 years"
          student={this.props.student}
          yAxis={merge(this.percentileYAxis(), {
            title: { text: 'Student growth percentile (SGP)' }
          })} />
      </DetailsSection>
    );
  }

}

ElaDetails.propTypes = {
  chartData: PropTypes.shape({
    star_series_reading_percentile: PropTypes.array.isRequired,
    mcas_series_ela_scaled: PropTypes.array,
    next_gen_mcas_ela_scaled: PropTypes.array,
    mcas_series_ela_growth: PropTypes.array.isRequired
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
