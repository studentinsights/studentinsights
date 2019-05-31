import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import chroma from 'chroma-js';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {high, medium, low} from '../helpers/colors';
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
  DIBELS_FSF_WPM,
  DIBELS_PSF_WPM,
  DIBELS_LNF_WPM,
  DIBELS_NWF_CLS,
  prettyDibelsText,
  somervilleDibelsThresholdsFor
} from '../reading/readingData';
import DibelsMegaChart from './DibelsMegaChart';
import SliderChart from '../reading/SliderChart';

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
    const notes = json.event_notes;
    const benchmarkDataPoints = json.benchmark_data_points;
    const currentSchoolYear = json.current_school_year;
    const dataPointsByAssessmentKey = _.groupBy(benchmarkDataPoints, 'benchmark_assessment_key');

    return this.renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey);
  }

  renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey) {
    const {nowFn} = this.context;
    return (
      <div style={{marginTop: 10}}>
        <Ingredient
          name="See themselves as a reader"
          color="#4db1f0"
          notes={
            <ChipForNotes
              nowMoment={nowFn()}
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
              nowMoment={nowFn()}
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
              nowMoment={nowFn()}
              matches={findNotes(ENGLISH_SEARCH, notes)}
            />
          }
        >
          <Sub name="spoken" />
          <Sub name="written" />
        </Ingredient>
        <Ingredient
          name="Discriminate Sounds in Words"
          color="rgb(227, 121, 58)"
          notes={
            <ChipForNotes
              nowMoment={nowFn()}
              matches={findNotes(SOUNDS_IN_WORDS_SEARCH, notes)}
            />
          }>
          <Sub
            name="blending"
            diagnostic={<Chip
              nowMoment={nowFn()}
              concernKey="high"
              atMoment={toMoment('12/19/2018')}
              el="PAST"
            />}
          />
          <Sub
            name="deleting"
          />
          <Sub
            name="substituting"
            diagnostic={<Chip
              nowMoment={nowFn()}
              concernKey="medium"
              atMoment={toMoment('5/19/2019')}
              el="PAST"
            />}
          />
        </Ingredient>
        <Ingredient
          name="Represent Sounds with Letters"
          color="rgb(100, 186, 91)"
          notes={
            <ChipForNotes
              nowMoment={nowFn()}
              matches={findNotes(SOUNDS_AND_LETTERS_SEARCH, notes)}
            />
          }
          isLast={true}>
          <Sub name="letters" diagnostic="Lively letters" />
          <Sub name="accurate" />
          <Sub name="fluent" />
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
  nowFn: PropTypes.func.isRequired
};
ReaderProfileJune.propTypes = {
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
  const color = chroma(props.color).alpha(0.25).desaturate(0.75).hex();
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
  const {nowMoment, atMoment, concernKey, disableWhenText, el} = props;
  const daysAgo = nowMoment.clone().diff(atMoment, 'days');
  const bucket = bucketForChip(daysAgo);
  const freshnessStyle = {
    months: {opacity: 1.0},
    year: {opacity: 0.4},
    old: {opacity: 0.1}
  }[bucket];
  const concernStyle = {
    low: {backgroundColor: high},
    medium: {backgroundColor: medium},
    high: {backgroundColor: low}
  }[concernKey];
  const title = _.compact([
    `Freshness: ${daysAgo} days ago`,
    concernKey ? `Concern: ${concernKey}` : null
  ]).join("\n");


  const whenText = (disableWhenText) ? null : ` ${daysAgo} days`;
  return (
    <div className="Chip" title={title} onClick={() => alert('not finished yet...')} style={{
      padding: 5,
      fontSize: 12,
      cursor: 'pointer',
      ...freshnessStyle,
      ...concernStyle,
    }}>{el}{whenText}</div>
  );
}

function bucketForChip(daysAgo) {
  if (daysAgo <= 90) return 'months';
  if (daysAgo <= 365) return 'year';
  return 'old';
}

function ChipForNotes(props) {
  const {nowMoment, matches} = props;
  const mostRecentMoment = _.last(matches.map(match => toMomentFromTimestamp(match.note.recorded_at)).sort());
  return (
    <Chip
      nowMoment={nowMoment}
      atMoment={mostRecentMoment}
      disableWhenText={true}
      el={<SearchResults matches={matches} />}
    />
  );
}