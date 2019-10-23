import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import External from '../components/External';
import NoteText from '../components/NoteText';
import CleanSlateFeedView from '../feed/CleanSlateFeedView';
import {
  DIBELS_LNF,
  DIBELS_FSF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  DIBELS_DORF_ACC,
  DIBELS_DORF_WPM,
  F_AND_P_ENGLISH,
  somervilleReadingThresholdsFor
} from '../reading/thresholds';
import {benchmarkPeriodKeyFor} from '../reading/readingData';
import {
  SEE_AS_READER_SEARCH,
  ORAL_LANGUAGE_SEARCH,
  ENGLISH_SEARCH,
  SOUNDS_IN_WORDS_SEARCH,
  SOUNDS_AND_LETTERS_SEARCH
} from './TextSearchForReading';
import ChipForIEP, {buildLunrIndexForIEP, findWithinIEP} from './ChipForIEP';
import ChipForNotes, {buildLunrIndexForNotes, findWithinNotes} from './ChipForNotes';
import ChipForLanguage from './ChipForLanguage';
import ChipForDibels from './ChipForDibels';
import ChipForFAndPEnglish from './ChipForFAndPEnglish';
import ChipForService from './ChipForService';
import DibelsDialog from './DibelsDialog';
import FAndPDialog from './FAndPDialog';
import ReaderProfileDialog from './ReaderProfileDialog';
import {Ingredient, Sub, MultipleChips, NotesContainer} from './layout';
import {Suggestion, Why} from './containers';
import {statsForDataPoint} from './ChipForDibels';

 // TODO(kr) path
import {xAxisWithGrades, gradesAxis} from '../student_profile/highchartsXAxisWithGrades';
import {lineChartOptions} from '../student_profile/highchartsLineChart';
import HighchartsWrapper from '../components/HighchartsWrapper';
import {adjustedGrade} from '../helpers/gradeText';
import {toSchoolYear} from '../helpers/schoolYear';
import {
  high,
  medium,
  low
} from '../helpers/colors';

 // TODO(kr) experimental

export default class ReaderProfileOctober extends React.Component {
  render() {
    const {feedCards, iepContents} = this.props;
    const notes = feedCards.map(card => card.json);
    const lunrIndex = buildLunrIndexForNotes(notes);
    const iepLunrIndex = (iepContents && iepContents.parsed)
      ? buildLunrIndexForIEP(iepContents.parsed.cleaned_text)
      : null;

    return (
      <div style={{marginTop: 100}}>
        {this.renderChart(DIBELS_LNF)}
        {this.renderChart(DIBELS_FSF)}
        {this.renderChart(DIBELS_PSF)}
        {this.renderChart(DIBELS_NWF_CLS)}
        {this.renderChart(DIBELS_NWF_WWR)}
        {this.renderChart(DIBELS_DORF_ACC)}
        {this.renderChart(DIBELS_DORF_WPM)}
        {/*this.renderChart(F_AND_P_ENGLISH)*/}
      </div>
    );
  }

  renderChart(benchmarkAssessmentKey) {
    const {nowFn} = this.context;
    const {student, dataPointsByAssessmentKey} = this.props;

  
    // map and sort
    const nowMoment = nowFn();
    const nMonthsBack = 36;
    const gradeNow = '4'; // student.grade;
    const benchmarkDataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey] || [];  
    const rows = benchmarkDataPoints.map(dataPoint => {
      return statsForDataPoint(dataPoint, gradeNow, nowMoment);
    });
    const sortedRows = _.sortBy(rows, row => row.atMoment.unix());
    const seriesDataPoints = sortedRows.map(row => {
      return [row.atMoment.unix()*1000, parseInt(row.score, 10)]; // todo(kr) naive here
    });
    
    console.log('seriesDataPoints', seriesDataPoints);
    // order matters for visual layering (essentially, only show orange)
    const benchmarkSeriesData = thresholdSeries(benchmarkAssessmentKey, gradeNow, nowMoment, nMonthsBack, 'benchmark');
    const series = [
      // { opacity: 0.5, marker: { symbol: 'circle', radius: 1 }, name: 'Above benchmark', color: high, data: benchmarkSeriesData.map(d => [d[0], d[1] * 1.20]) },
      { opacity: 0.5, marker: { symbol: 'circle', radius: 0 }, name: 'Benchmark', color: high, data: benchmarkSeriesData },
      { opacity: 0.5, marker: { symbol: 'circle', radius: 0 }, name: 'Risk point', color: medium, data: thresholdSeries(benchmarkAssessmentKey, gradeNow, nowMoment, nMonthsBack, 'risk') },
      { marker: { symbol: 'circle', radius: 3 }, name: benchmarkAssessmentKey, color: '#000000', data: seriesDataPoints }
    ];
    console.log('series', series);

    const highchartsOptions = {
      ...lineChartOptions(),
      chart: {
        ...lineChartOptions().chart,
        type: 'areaspline'
      },

      // import {lineChartOptions} from './highchartsLineChart';
      // import {yAxisPercentileOptions} from './highchartsYAxisPercentileOptions';
      yAxis: {
        // ...defaultYAxis,
        // plotLines: nextGenBandsPlotlines,
        title: { text: '' }
      },
      // xAxis: xAxisWithGrades(gradeNow, nowMoment, {nMonthsBack}),
      xAxis: [gradesAxis(nowMoment, nMonthsBack, gradeNow)],
       series: JSON.parse(JSON.stringify(series)) // hacking
    };
    const box = {
      width: 300,
      height: 250,
      marginTop: 20,
      marginRight: 20,
      display: 'inline-block',
      border: '1px solid #ccc',
      padding: 10
    };
    return (
      <div style={box}>
        <div style={{fontSize: 12, fontWeight: 'bold'}}>{benchmarkAssessmentKey}</div>
        <HighchartsWrapper style={{height: 200}} {...highchartsOptions} />
      </div>
    );
  }
}
/*
        />
        {sortedRows.map(row => {
          const {
            id,
            prettyAssessmentText,
            score,
            atMoment,
            gradeThen,
            thresholds,
            concernKey
          } = row;
          return (
            <Card key={id} style={{marginBottom: 20}}>
              <div style={{display: 'flex'}}>
                <div style={{marginRight: 10}}><b>{prettyAssessmentText}</b></div>
                <div>{atMoment.from(nowMoment)} on {atMoment.format('M/D/YY')}</div>
              </div>
              <ScoreBadge
                concernKey={concernKey}
                score={score}
                innerStyle={{margin: 10}}
              />
              <div>{thresholdsExplanation(thresholds)}</div>
              <div>in {gradeText(gradeThen)}</div>
            </Card>
    return (
      <DibelsDialog
        gradeNow={student.grade}
        benchmarkDataPoints={benchmarkDataPoints}
      />
    );
*/
ReaderProfileOctober.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
ReaderProfileOctober.propTypes = {
  access: PropTypes.object,
  services: PropTypes.array.isRequired,
  iepContents: PropTypes.object,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired,
  feedCards: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentSchoolYear: PropTypes.number.isRequired,
  dataPointsByAssessmentKey: PropTypes.object.isRequired
};


const styles = {
  rightDialog: {
    content: {
      right: 40,
      left: 'auto',
      width: '55%',
      top: 100,
      bottom: 100
    }
  },
  leftDialog: {
    content: {
      left: 40,
      right: 'auto',
      width: '55%',
      top: 100,
      bottom: 100
    }
  },
};


// function absenceSeriesFn(monthBuckets) {
//   return [{
//     name: 'Excused',
//     color: '#ccc',
//     showInLegend: true,
//     data: _.map(monthBuckets, es => es.filter(e => e.excused).length)
//   },
//   {
//     name: 'Unexcused absences',
//     color: '#7cb5ec',
//     showInLegend: true,
//     data: _.map(monthBuckets, es => es.filter(e => !e.excused).length)
//   }];
// }


// function absenceTooltipFn(monthBuckets) {
//   return {
//     formatter: createUnsafeTooltipFormatter(monthBuckets, tooltipTextFn),
//     useHTML: true
//   };
// }

 // this is hacked
function expandSeries(benchmarkAssessmentKey, gradeNow, nowMoment, nMonthsBack, expandFn) {
  var nextMoment = nowMoment.clone().subtract(nMonthsBack, 'months');
  var items = [];
  while (nextMoment.isBefore(nowMoment)) {
    const benchmarkPeriodKeyThen = benchmarkPeriodKeyFor(nextMoment);
    const gradeThen = adjustedGrade(toSchoolYear(nextMoment.toDate()), gradeNow, nowMoment);
    console.log('benchmarkAssessmentKey, gradeThen, benchmarkPeriodKeyThen', benchmarkAssessmentKey, gradeThen, benchmarkPeriodKeyThen);
    const value = expandFn(benchmarkAssessmentKey, gradeThen, benchmarkPeriodKeyThen);
    if (value !== null) {
      items.push([nextMoment.unix() * 1000, value]);
    }
    nextMoment = nextMoment.add(3, 'months');
  }
  return items;
  // return sortedRows.map(row => {
  //   const benchmarkPeriodKeyThen = benchmarkPeriodKeyFor(row.atMoment);
  //   const thresholds = somervilleReadingThresholdsFor(benchmarkAssessmentKey, row.gradeThen, benchmarkPeriodKeyThen)
  //   const value = thresholds ? thresholds[thresholdKey] : null;
  //   return [row.atMoment.toDate().valueOf(), value];
  // });
}

function thresholdSeries(benchmarkAssessmentKey, gradeNow, nowMoment, nMonthsBack, thresholdKey) {
  return expandSeries(benchmarkAssessmentKey, gradeNow, nowMoment, nMonthsBack, (benchmarkAssessmentKey, gradeThen, benchmarkPeriodKeyThen) => {
    const thresholdsThen = somervilleReadingThresholdsFor(benchmarkAssessmentKey, gradeThen, benchmarkPeriodKeyThen);
    return thresholdsThen ? thresholdsThen[thresholdKey] : null;
  });
}
