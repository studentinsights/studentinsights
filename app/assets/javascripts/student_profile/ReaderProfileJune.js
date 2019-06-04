import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import chroma from 'chroma-js';
import {AutoSizer} from 'react-virtualized';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {high, medium, low} from '../helpers/colors';
import {isEnglishLearner, roundedWidaLevel} from '../helpers/language';
import {gradeText, adjustedGrade} from '../helpers/gradeText';
import {toMoment, toMomentFromTimestamp} from '../helpers/toMoment';
import Hover from '../components/Hover';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import {
  SearchResults,
  findNotes,
  SEE_AS_READER_SEARCH,
  ORAL_LANGUAGE_SEARCH,
  ENGLISH_SEARCH,
  SOUNDS_IN_WORDS_SEARCH,
  SOUNDS_AND_LETTERS_SEARCH
} from './readingSearch';
import {
  DIBELS_LNF,
  DIBELS_PSF,
  DIBELS_NWF_CLS,
  DIBELS_NWF_WWR,
  DIBELS_DORF_ACC,
  DIBELS_DORF_WPM,
  somervilleReadingThresholdsFor
} from '../reading/thresholds';
import {
  prettyDibelsText,
  shortDibelsText,
  benchmarkPeriodToMoment,
  bucketForDibels,
  DIBELS_GREEN,
  DIBELS_YELLOW,
  DIBELS_RED,
  DIBELS_UNKNOWN
} from '../reading/readingData';
import DibelsMegaChart from './DibelsMegaChart';
import SliderChart from '../reading/SliderChart';
import LanguageStatusLink from './LanguageStatusLink';


/* todo
<h1>older grades, or still need to add in somewhere</h1>
<div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=QuickPhonicsScreener.pdf">Quick Phonics Screener</a>)}</div>
<div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=Decoding+Survey.pdf">Decoding Screener</a>)}</div>
<h2>other bits</h2>
<div>sped eval from melissa's chart</div>
<div>TOWRE in older grades?</div>
<div>maybe CTOPP naming in older grades (instead of SPS RAN)?</div>
<div>CELF maybe for older grades? speech eval?</div>
<div>working memory: WISC-5 maybe in older grades? not K</div>
*/
export default class ReaderProfileJune extends React.Component {
  render() {
    const {student} = this.props;
    const {id} = student;
    return (
      <div className="ReaderProfileJune">
        <SectionHeading>Reader Profile (June v2)</SectionHeading>
        <GenericLoader
          promiseFn={() => apiFetchJson(`/api/students/${id}/reader_profile_json`)}
          render={json => this.renderJson(json)} />
      </div>
    );
  }

  renderJson(json) {
    const grade = json.grade;
    const notes = json.feed_cards.map(card => card.json);
    const benchmarkDataPoints = json.benchmark_data_points;
    const currentSchoolYear = json.current_school_year;
    const dataPointsByAssessmentKey = _.groupBy(benchmarkDataPoints, 'benchmark_assessment_key');

    return this.renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey);
  }

  renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey) {
    const {nowFn, districtKey} = this.context;
    const {student, access} = this.props;
    const nowMoment = nowFn();
    return (
      <div style={{marginTop: 10}}>
        <Ingredient
          name="See themselves as a reader"
          color="#4db1f0"
          notes={
            <ChipForNotes
              nowMoment={nowMoment}
              matches={findNotes(SEE_AS_READER_SEARCH, notes)}
            />
          }
        >
          <Sub name="within class" />
          <Sub name="outside school" />
        </Ingredient>
        <Ingredient
          name="Communicate with oral language"
          color="#f06060"
          notes={
            <ChipForNotes
              nowMoment={nowMoment}
              matches={findNotes(ORAL_LANGUAGE_SEARCH, notes)}
            />
          }
        >
          <Sub name="expressive" />
          <Sub name="receptive" />
        </Ingredient>
        <Ingredient
          name="Speak and listen in English"
          color="rgba(140, 17, 140, 0.57)"
          notes={
            <ChipForNotes
              nowMoment={nowMoment}
              matches={findNotes(ENGLISH_SEARCH, notes)}
            />
          }
        >
          <Sub name="spoken"
            screener={
              <ChipForLanguage
                accessKey="oral"
                nowMoment={nowMoment}
                districtKey={districtKey}
                student={student}
                access={access}
              />
            }
          />
          <Sub name="written"
            screener={
              <ChipForLanguage
                accessKey="literacy"
                nowMoment={nowMoment}
                districtKey={districtKey}
                student={student}
                access={access}
              />
            }
          />
        </Ingredient>
        <Ingredient
          name="Discriminate Sounds in Words"
          color="rgb(227, 121, 58)"
          notes={
            <ChipForNotes
              nowMoment={nowMoment}
              matches={findNotes(SOUNDS_IN_WORDS_SEARCH, notes)}
            />
          }>
          <Sub
            name="blending"
            screener={<ChipForDibels
              benchmarkAssessmentKey={DIBELS_PSF}
              student={student}
              nowMoment={nowMoment}
              dataPointsByAssessmentKey={dataPointsByAssessmentKey}
            />}
            /* visual diagnostic={<Chip
              nowMoment={nowMoment}
              concernKey="high"
              atMoment={toMoment('12/19/2018')}
              el="PAST"
            />}*/
          />
          <Sub
            name="deleting"
          />
          <Sub
            name="substituting"
            /* visual diagnostic={<Chip
              nowMoment={nowMoment}
              concernKey="medium"
              atMoment={toMoment('5/19/2019')}
              el="PAST"
            />}*/
          />
        </Ingredient>
        <Ingredient
          name="Represent Sounds with Letters"
          color="rgb(100, 186, 91)"
          notes={
            <ChipForNotes
              nowMoment={nowMoment}
              matches={findNotes(SOUNDS_AND_LETTERS_SEARCH, notes)}
            />
          }
          isLast={true}>
          <Sub name="letters"
            /* visual diagnostic="Lively letters" */
            screener={<ChipForDibels
              benchmarkAssessmentKey={DIBELS_LNF}
              student={student}
              nowMoment={nowMoment}
              dataPointsByAssessmentKey={dataPointsByAssessmentKey}
            />}
          />
          <Sub name="accurate"
            screener={<MultipleChips chips={[
              <ChipForDibels
                benchmarkAssessmentKey={DIBELS_DORF_ACC}
                student={student}
                nowMoment={nowMoment}
                dataPointsByAssessmentKey={dataPointsByAssessmentKey}
              />
            ]}/>}
          />
          <Sub name="fluent"
            screener={<MultipleChips chips={[
              <ChipForDibels
                benchmarkAssessmentKey={DIBELS_DORF_WPM}
                student={student}
                nowMoment={nowMoment}
                dataPointsByAssessmentKey={dataPointsByAssessmentKey}
              />,
              <ChipForDibels
                benchmarkAssessmentKey={DIBELS_NWF_WWR}
                student={student}
                nowMoment={nowMoment}
                dataPointsByAssessmentKey={dataPointsByAssessmentKey}
              />,
              <ChipForDibels
                benchmarkAssessmentKey={DIBELS_NWF_CLS}
                student={student}
                nowMoment={nowMoment}
                dataPointsByAssessmentKey={dataPointsByAssessmentKey}
              />
            ]}/>}
          />
          <Sub name="spelling" />
        </Ingredient>
      </div>
    );
  }

  renderDibels(benchmarkAssessmentKey, currentSchoolYear, dataPointsByAssessmentKey, grade) {
    const labelText = prettyDibelsText(benchmarkAssessmentKey);
    const benchmarkDataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey];
    return (
      <div style={{display: 'flex', flexDirection: 'column', marginBottom: 15}}>
        <div style={{fontSize: 12, marginBottom: 2, textAlign: 'left'}}>{labelText}</div>
        {/*<SliderChart
          risk={thresholds.risk}
          benchmark={thresholds.benchmark}
          range={{
            [DIBELS_FSF_WPM]: [0, 100],
            [DIBELS_LNF_WPM]: [0, 100],
            [DIBELS_PSF_WPM]: [0, 100],
            [DIBELS_NWF_CLS]: [0, 200]
          }[benchmarkAssessmentKey]}
          values={benchmarkDataPoints.map(d => d.json.data_point)}
          height={100}
        />*/}
        <DibelsMegaChart
          currentGrade={grade}
          benchmarkDataPoints={benchmarkDataPoints}
          currentSchoolYear={currentSchoolYear}
          benchmarkAssessmentKey={benchmarkAssessmentKey}
        />
      </div>
    );
  }
}
ReaderProfileJune.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
ReaderProfileJune.propTypes = {
  access: PropTypes.object,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};

const styles = {
  nameCell: {
    width: 150,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  cell: {
    width: 160,
    height: 40,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }
};
function missingEl(text) {
  return (
    <Hover>{isHovering => {
      const style = {
        ...styles.cell, 
        cursor: 'pointer',
        ...(isHovering ? {color: '#aaa'} : {color: '#eee'})
      };
      return <div
        style={style}
        onClick={() => alert(`Here are some ${text} to try...`)}
      >+{text}</div>;
    }}</Hover>
  );
}

function Ingredient(props) {
  const {name, notes, children, isLast} = props;
  // const color = chroma(props.color).alpha(0.25).desaturate(0.75).hex();
  const color = '#eee';
  return (
    <div className="Ingredient">
      <div style={{padding: 2, background: color, borderRadius: 30}}>
        <div style={{
          marginLeft: 15,
          padding: 5,
          fontSize: 16,
          color: 'black',
          fontWeight: 'bold'
        }}>{name}</div>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        marginLeft: 15,
        marginRight: 15,
        ...(isLast ? {borderBottom: `3px solid ${color}`}: {})
      }}>
        <div style={{
          paddingLeft: 10,
          borderLeft: `3px solid ${color}`,
        }}>{children}</div>
        <div style={{
          flex: 1,
          borderRight: `1px solid ${color}`
        }}>{notes || missingEl('notes')}</div>
      </div>
    </div>
  );
}

function Sub(props) {
  const {name, screener, diagnostic, interventions} = props;  
  return (
    <div className="Sub" style={{display: 'flex', flexDirection: 'row'}}>
      <div style={styles.nameCell}>{name}</div>
      <div style={styles.cell}>{screener || missingEl('screener')}</div>
      <div style={styles.cell}>{diagnostic || missingEl('diagnostic')}</div>
      <div style={styles.cell}>{interventions || missingEl('interventions')}</div>
    </div>
  );
}

function Chip(props) {
  const {
    nowMoment,
    style,
    atMoment,
    concernKey,
    disableWhenText,
    score,
    thresholds,
    prettyAssessmentText,
    periodThen,
    el
  } = props;
  const daysAgo = atMoment ? nowMoment.clone().diff(atMoment, 'days') : null;
  const freshnessText = (daysAgo && !disableWhenText)
    ? `${daysAgo} days ago`
    : null;
  const concernStyle = {
    low: {backgroundColor: high},
    medium: {backgroundColor: medium},
    high: {backgroundColor: low},
    unknown: {backgroundColor: '#eee'}
  }[concernKey];

  // hover text
  const thresholdsText = (thresholds)
    ? `risk: ${thresholds.risk} / benchmark: ${thresholds.benchmark}`
    : null;
  const title = _.compact([
    prettyAssessmentText,
    '---------------------------------',
    `Freshness: ${freshnessText || 'unknown'}`,
    `Updated: ${periodThen}`,
    ((score || thresholds) ? '' : null),
    (score ? `Score: ${score}` : null),
    (thresholds ? `Cut points: ${thresholdsText}` : null),
    concernKey ? `Concern: ${concernKey}` : null
  ]).join("\n");


  return (
    <div className="Chip" title={title} onClick={() => alert('not finished yet...')} style={{
      fontSize: 12,
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'flex-start',
      border: '1px solid white',
      paddingLeft: 8,
      cursor: 'pointer',
      ...concernStyle,
      ...style
    }}>
      <Freshness daysAgo={daysAgo}>
        <AutoSizer disableHeight>{({width}) => (
          <div style={{width}}>
            <div style={{overflowX: 'hidden', height: 20}}>{el}</div>
            {freshnessText && <div style={{overflowX: 'hidden', height: 20}}>
              {(width > 80) ? `${daysAgo} days ago` : `${daysAgo}d`}
            </div>}  
          </div>
        )}</AutoSizer>
      </Freshness>
    </div>
  );
}

function bucketForChip(daysAgo) {
  if (daysAgo === null || daysAgo ===  undefined) return 'unknown';
  if (daysAgo <= 90) return 'months';
  if (daysAgo <= 365) return 'year';
  return 'old';
}

function stylesForFreshness(daysAgo) {
  const bucket = bucketForChip(daysAgo);
  return {
    months: {opacity: 1.0},
    unknown: {opacity: 0.8},
    year: {opacity: 0.4},
    old: {opacity: 0.2}
  }[bucket];
}


function ChipForNotes(props) {
  const {nowMoment, matches} = props;
  const mostRecentMoment = _.last(matches.map(match => toMomentFromTimestamp(match.note.recorded_at)).sort());
  const daysAgo = mostRecentMoment ? nowMoment.clone().diff(mostRecentMoment, 'days') : null;
  return (
    <Freshness daysAgo={daysAgo}>
      <SearchResults
        style={{border: '1px solid white', cursor: 'pointer'}}
        matches={matches} />
    </Freshness>
  );
}

function dataPointMoment(dataPoint) {
  return benchmarkPeriodToMoment(dataPoint.benchmark_period_key, dataPoint.benchmark_school_year);
}

// TODO(kr) unroll to show historical
function ChipForDibels(props) {
  const {student, nowMoment, benchmarkAssessmentKey, dataPointsByAssessmentKey} = props;

  // pick latest
  const dataPoints = dataPointsByAssessmentKey[benchmarkAssessmentKey] || [];
  console.log(benchmarkAssessmentKey, 'dataPoints', dataPoints);
  const mostRecentDataPoint = _.last(_.sortBy(dataPoints, d => {
    const assessmentMoment = dataPointMoment(d);
    return (assessmentMoment) ? assessmentMoment.unix() : Number.MIN_VALUE;
  }));
  if (!mostRecentDataPoint) return null;

  // guess as grade at time of assessment
  const gradeThen = adjustedGrade(mostRecentDataPoint.benchmark_school_year, student.grade, nowMoment);

  // determine color
  const dibelsBucket = bucketForDibels(...[
    mostRecentDataPoint.json.value,
    mostRecentDataPoint.benchmark_assessment_key,
    gradeThen,
    mostRecentDataPoint.benchmark_period_key
  ]);
  const concernKey = {
    [DIBELS_GREEN]: 'low',
    [DIBELS_YELLOW]: 'medium',
    [DIBELS_RED]: 'high',
    [DIBELS_UNKNOWN]: 'unknown'
  }[dibelsBucket];

  // also show cut points
  const thresholds = somervilleReadingThresholdsFor(...[
    mostRecentDataPoint.benchmark_assessment_key,
    gradeThen,
    mostRecentDataPoint.benchmark_period_key
  ]);

  const prettyAssessmentText = prettyDibelsText(benchmarkAssessmentKey);
  const WIDTH_THRESHOLD_PIXELS = 80;
  return (
    <AutoSizer disableHeight>{({width}) => (
      <Chip
        style={{width}}
        nowMoment={nowMoment}
        atMoment={dataPointMoment(mostRecentDataPoint)}
        periodThen={
          `${mostRecentDataPoint.benchmark_period_key} ${mostRecentDataPoint.benchmark_school_year} in ${gradeText(gradeThen)}`
        }
        prettyAssessmentText={prettyAssessmentText}
        score={mostRecentDataPoint.json.value}
        thresholds={thresholds}
        concernKey={concernKey}
        el={
          <div title={JSON.stringify(dataPoints, null, 2)}>
            {width > WIDTH_THRESHOLD_PIXELS ? prettyAssessmentText : shortDibelsText(mostRecentDataPoint.benchmark_assessment_key)}
          </div>
        }
      />
    )}</AutoSizer>
  );
}
              


function MultipleChips(props) {
  const {chips} = props;
  return <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    overflow: 'hidden'
  }}>{chips.map((chip, index) => (
    <div key={index} style={{
      flex: 1,
      overflowY: 'hidden',
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      height: '100%'
    }}>{chip}</div>
  ))}</div>;
}


function ChipForLanguage(props) {
  const {student, access, accessKey, nowMoment, districtKey} = props;
  const limitedEnglishProficiency = student.limited_english_proficiency;
  const languageStatusLink = (
    <LanguageStatusLink
      style={{fontSize: 12}}
      studentFirstName={student.first_name}
      ellTransitionDate={student.ell_transition_date}
      limitedEnglishProficiency={limitedEnglishProficiency}
      access={access} 
    />
  );

  // TODO(kr) improve to split oral / written
  const concernKey = isEnglishLearner(districtKey, limitedEnglishProficiency)
    ? 'medium'
    : 'low';

  // TODO(kr) improve
  const dataPoint = (access || {})[accessKey];
  const mostRecentMoment = languageAssessmentMoment(dataPoint);
  
  // render as score, use fractions for composites
  const score = (!dataPoint)
    ? null 
    : roundedWidaLevel(dataPoint.performance_level, {shouldRenderFractions: true});
  return (
    <Chip
      nowMoment={nowMoment}
      atMoment={mostRecentMoment}
      periodThen={mostRecentMoment ? mostRecentMoment.format('M/D/YY') : null} // TODO(kr) in grade level?
      prettyAssessmentText={`ACCESS ${accessKey}`}
      score={score}
      // thresholds={thresholds}
      concernKey={concernKey}
      el={languageStatusLink}
    />
  );
}

function languageAssessmentMoment(dataPoint) {
  if (!dataPoint) return null;
  if (!dataPoint.date_taken) return null;
  return toMomentFromTimestamp(dataPoint.date_taken);
}

function Freshness(props) {
  const {daysAgo, style, innerStyle, children} = props;
  const freshnessStyle = stylesForFreshness(daysAgo);
  return (
    <Hover style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      ...style
    }}>{isHovering => (
      <div style={{
        ...innerStyle,
        height: '100%',
        width: '100%',
        display: 'flex',
        ...(isHovering ? {} : freshnessStyle)
      }}>{children}</div>
    )}</Hover>
  );
}