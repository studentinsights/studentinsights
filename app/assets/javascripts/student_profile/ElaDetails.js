import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
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
  
  renderStarReading() {
    const {chartData, studentGrade} = this.props;
    return (
      <DetailsSection key="star" title="STAR Reading, last 4 years">
        <StarChart
          starSeries={chartData.star_series_reading_percentile || []}
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
