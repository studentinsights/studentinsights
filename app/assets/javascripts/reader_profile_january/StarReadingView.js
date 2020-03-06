import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import StarChart from '../student_profile/StarChart';
import {adjustedGrade, gradeText} from '../helpers/gradeText';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import {toSchoolYear} from '../helpers/schoolYear';
import {shouldHighlight} from '../helpers/star';
import {benchmarkPeriodKeyFor} from '../reading/readingData';
import expandedViewPropTypes from './expandedViewPropTypes';
import {pureBoxStyle} from './colors';
import {COMPREHENSION} from './instructionalStrategies';
import {matchStrategies} from './instructionalStrategies';
import ExpandedLayout from './ExpandedLayout';
import Strategies from './Strategies';
import Expandable from './Expandable';
import {BoxChartContainer, YearBoxContainer, boxStructureStyle} from './BoxChartElements';


export default class StarReadingView extends React.Component {
  render() {
    const {onClose, student} = this.props;

    return (
      <ExpandedLayout
        titleText="STAR Reading"
        studentFirstName={student.first_name}
        materialsEl={this.renderMaterials()}
        strategiesEl={this.renderStrategies()}
        dataEl={this.renderData()}
        onClose={onClose}
      />
    );
  }

  renderMaterials() {
    return null;
  }

  renderStrategies() {
    const {student, instructionalStrategies} = this.props;
    const strategies = matchStrategies(instructionalStrategies, student.grade, COMPREHENSION);
    return <Strategies strategies={strategies} />;
  }

  renderData() {
    return (
      <div className="Data">
        <div style={styles.mainBox}>
          {this.renderBoxChart()}
        </div>
        <div>
          {this.renderExpandableChart()}
        </div>
      </div>
    );
  }

  renderBoxChart() {
    const {nowFn} = this.context;
    const schoolYear = toSchoolYear(nowFn());

    return (
      <BoxChartContainer>
        {this.renderYearBoxFor(schoolYear - 1)}
        {this.renderYearBoxFor(schoolYear, {paddingLeft: 20})}
      </BoxChartContainer>
    );
  }

  renderYearBoxFor(schoolYear, style = {}) {
    const {nowFn} = this.context;
    const {student, readerJson} = this.props;

    // bucket percentiles into buckets for this school year
    const periodKeys = ['fall', 'winter', 'spring'];
    const starSeries = starSeriesFrom(readerJson);
    const mostRecentStarForPeriods = periodKeys.map(periodKey => {
      const starWithinPeriod = starSeries.filter(star => {
        if (toSchoolYear(star.date_taken) !== schoolYear) return false;
        if (benchmarkPeriodKeyFor(toMomentFromTimestamp(star.date_taken)) !== periodKey) return false;
        return true;
      });
      const mostRecent = _.last(_.orderBy(starWithinPeriod, s => toMomentFromTimestamp(s.date_taken).unix()));
      return mostRecent;
    });

    // render
    const gradeThen = adjustedGrade(schoolYear, student.grade, nowFn());
    const captionEl = `${gradeText(gradeThen)}, ${schoolYear}`;
    const periodEls = mostRecentStarForPeriods.map((maybeStar, index) => {

      const maybePercentile = maybeStar ? maybeStar.percentile_rank : null;
      const isOrange = shouldHighlight(maybePercentile);
      const boxStyle = pureBoxStyle(isOrange, boxStructureStyle);
      const text = maybePercentile ? maybePercentile : 'none';
      return (
        <div key={index} style={boxStyle} title={text}>
          {text}
        </div>
      );
    });
    return (
      <YearBoxContainer
        style={style}
        periodEls={periodEls}
        captionEl={captionEl}
      />
    );
  }

  renderExpandableChart() {
    const {student, readerJson} = this.props;
    const starSeries = starSeriesFrom(readerJson);
    return (
      <Expandable text="Chart for all scores">
        <div style={{border: '1px solid #ccc', padding: 15}}>
          <StarChart
            starSeries={starSeries}
            studentGrade={student.grade}
          />
        </div>
      </Expandable>
    );
  }
}
StarReadingView.propTypes = expandedViewPropTypes;
StarReadingView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const styles = {
  mainBox: {
    marginBottom: 40
  }
};


function starSeriesFrom(readerJson) {
  return readerJson.reading_chart_data.star_series_reading_percentile || [];
}
