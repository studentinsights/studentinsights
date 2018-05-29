import React from 'react';
import PropTypes from 'prop-types';
import {merge} from '../helpers/merge';
import ProfileChart from './ProfileChart';
import ProfileChartSettings from './ProfileChartSettings';


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
    return (
      <div className="MathDetails">
        {this.renderNavBar()}
        {this.renderStarMath()}
        {this.renderMCASMathScores()}
        {this.renderMCASMathNextGenScores()}
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
    return (
      <div style={styles.navBar}>
        <a style={styles.navBar} href="#starMath">
          STAR Math Chart
        </a>
        {' | '}
        {this.renderMCASNextGenLink()}
        {this.renderMCASLink()}
        <a style={styles.navBar} href="#MCASMathGrowth">
          MCAS Math SGPs
        </a>
      </div>
    );
  }

  renderHeader(title) {
    return (
      <div style={styles.secHead}>
        <h4 style={styles.title}>
          {title}
        </h4>
        <span style={styles.navTop}>
          <a href="#">
            Back to top
          </a>
        </span>
      </div>
    );
  }

  renderStarMath() {
    return (
      <div id="starMath" style={styles.container}>
        {this.renderHeader('STAR Math, last 4 years')}
        <ProfileChart
          quadSeries={[{
            name: 'Percentile rank',
            data: this.props.chartData.star_series_math_percentile
          }]}
          titleText="STAR Math, last 4 years"
          student={this.props.student}
          yAxis={merge(this.percentileYAxis(), {
            title: { text: 'Percentile rank' }
          })}
          showGradeLevelEquivalent= { true }/>
      </div>
    );
  }

  renderMCASMathNextGenScores() {
    const data = this.props.chartData.next_gen_mcas_mathematics_scaled;

    if (!data || data.length === 0) return null;

    return (
      <div id="MCASMathNextGen" style={styles.container}>
        {this.renderHeader('MCAS Next Gen Math Scores')}
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
      </div>
    );
  }

  renderMCASMathScores() {
    const data = this.props.chartData.mcas_series_math_scaled;

    if (!data || data.length === 0) return null;

    return (
      <div id="MCASMath" style={styles.container}>
        {this.renderHeader('MCAS Math Scores, last 4 years')}
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
      </div>
    );
  }

  renderMCASMathGrowth() {
    return (
      <div id="MCASMathGrowth" style={styles.container}>
        {this.renderHeader('MCAS Math SGPs, last 4 years')}
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
      </div>
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
  student: PropTypes.object.isRequired
};

const styles = {
  title: {
    color: 'black',
    paddingBottom: 20,
    fontSize: 24
  },
  container: {
    width: '100%',
    marginTop: 50,
    marginLeft: 'auto',
    marginRight: 'auto',
    border: '1px solid #ccc',
    padding: '30px 30px 30px 30px',
    position: 'relative'
  },
  secHead: {
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    bottom: 10
  },
  navBar: {
    fontSize: 18
  },
  navTop: {
    textAlign: 'right',
    verticalAlign: 'text-top'
  }
};