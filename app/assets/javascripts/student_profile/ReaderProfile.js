import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import lunr from 'lunr';
import {apiFetchJson} from '../helpers/apiFetchJson';
import {high, medium, low} from '../helpers/colors';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import GenericLoader from '../components/GenericLoader';
import SectionHeading from '../components/SectionHeading';
import tableStyles from '../components/tableStyles';
import Timestamp from '../components/Timestamp';
import NoteBadge from '../components/NoteBadge';
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

export default class ReaderProfile extends React.Component {
  render() {
    const {student} = this.props;
    const {id} = student;
    return (
      <div className="ReaderProfile">
        <SectionHeading>Reader Profile</SectionHeading>
        <GenericLoader
          promiseFn={() => apiFetchJson(`/api/students/${id}/reader_profile_json`)}
          render={json => this.renderJson(json)} />
      </div>
    );
  }

  renderJson(json) {
    const notes = json.event_notes;
    const benchmarkDataPoints = json.benchmark_data_points;
    const grade = json.grade;
    const currentSchoolYear = json.current_school_year;
    const dataPointsByAssessmentKey = _.groupBy(benchmarkDataPoints, 'benchmark_assessment_key');
  //   return (
  //     <div>
  //       {_.entries(dataPointsByAssessmentKey).map(([benchmarkAssessmentKey, dataPoints]) => {
  //         return (
  //           <div key={benchmarkAssessmentKey}>
  //             <h3>{prettyDibelsText(benchmarkAssessmentKey)}</h3>
  //             <div>{dataPoints.map(dataPoint => {
  //               const dataPointMoment = toMoment(currentSchoolYear, dataPoint.benchmark_period_key);
  //               return (
  //                 <div key={dataPointMoment.format('YYYYMMDD')}>{dataPointMoment.format('M/D/YY')}</div>
  //               );
  //             })}</div>
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // }
    return this.renderTable(notes, grade, currentSchoolYear, dataPointsByAssessmentKey);
  }

  renderTable(notes, grade, currentSchoolYear, dataPointsByAssessmentKey) {
    const backgroundColor = '#f8f8f8';
    const borderRight = '5px solid #aaa';
    const cell = {
      ...tableStyles.cell,
      whiteSpace: 'normal',
      backgroundColor,
      border: '1px solid #ccc',
      textAlign: 'center',
      verticalAlign: 'center'
    };
    const headerCell = {
      ...tableStyles.headerCell,
      width: 120,
      border: 0
    };
    const chartSizing = {
      width: 300
    };
    const tableStyle = {
      ...tableStyles.table,
      backgroundColor,
      margin: 0,
      marginTop: 10,
      padding: 0
    };
    const notesCell = {
      ...cell,
      padding: 5,
      width: 230
    };

    return (
      <table className="ReadingCurriculumView" style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCell}>
              <div><b>Ingredient</b></div>
              <div>Curriculum</div>
            </th>
            <th style={headerCell}>Tier 2</th>
            <th style={{...headerCell, borderRight}}>Tier 3</th>
            <th style={{...headerCell, ...chartSizing}}>Screeners</th>
            <th style={headerCell}>Evaluations</th>
            <th style={headerCell}>Notes</th>
            {/*<th style={headerCell}>IEPs</th>
            <th style={headerCell}>English</th>
            <th style={headerCell}>MTSS</th>*/}
          </tr>
        </thead>
        <tbody>
          <tr>
            {this.renderIngredientCell('Word parts', 'SPS Phonological', cell)}
            <td style={cell}>{fade('PA in small group, second time')}</td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_FSF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
              {this.renderDibels(DIBELS_PSF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
            </td>
            <td style={cell}><div>{fade('CTOPP')}</div></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Letter Names', 'Fundations</div', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}>{fade('Lively Letters')}</td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_LNF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
            </td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes, LETTER_NAMES)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Letter Sounds', 'Fundations</div', cell)}
            <td style={cell}>{fade('ERI in small group')}</td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              {this.renderDibels(DIBELS_NWF_CLS, currentSchoolYear, dataPointsByAssessmentKey, grade)}
            </td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes, LETTER_SOUNDS)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Tapping and Blending Written Words', 'Fundations</div', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Sight Words', 'Fundations</div', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('How texts work', 'Readers Workshop', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}>{fade('Heggerty')}</td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Left to Right', 'Readers Workshop', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}></td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
          <tr>
            {this.renderIngredientCell('Independent Reading', 'Readers Workshop', cell)}
            <td style={cell}></td>
            <td style={{...cell, borderRight}}></td>
            <td style={{...cell, ...chartSizing}}>
              <div>F&P</div>
              <div>Independent reading</div>
            </td>
            <td style={cell}></td>
            <td style={notesCell}>{findNotes(notes)}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  renderIngredientCell(ingredient, curriculum, cellStyle) {
    return (
      <td style={cellStyle}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <div><b>{ingredient}</b></div>
          <div>{curriculum}</div>
        </div>
      </td>
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

ReaderProfile.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired
};


function fade(text) {
  return <span style={{opacity: 0.25}}>{text}</span>;
}

const WORD_PARTS = [
  'phonological',
  'phonemic'
];
const LETTER_SOUNDS = [
  'sounds',
  'phonics',
  'decoding'
];
const LETTER_NAMES = [
  'letter'
];

// function findNotes(notesCell, words) {

//   if (!words) return null;

//   const bits = _.flatMap(notes, note => {
//     const matches = words.map(regex => regex.match(note.text));
// }

function findNotes(notes, words) {
  const documents = notes.map(note => {
    return {
      id: note.id,
      text: note.text
    };
  });

  const index = lunr(function() {
    this.ref('id');
    this.field('text');
    this.metadataWhitelist = ['position'];
    documents.forEach(doc => this.add(doc));
  });

  // window.index = index;
  const results = _.flatMap(words, word => index.search(word));
  // console.log('results', results);
  // return JSON.stringify(results);


  const matches = _.flatMap(results, result => {
    const note = notes.filter(note => note.id === parseInt(result.ref, 10))[0]; // need a better way :)
    if (!note) {
      // console.log('no note for result:', results);
      return [];
    }
    const positions = _.first(_.values(result.matchData.metadata)).text.position;
    return {note, positions};
    // // console.log('ok', note, positions);
    // return positions.map(position => {
    //   // console.log('>> note.text', note.text);
    //   const highlight = createHighlight(note.text, position[0], position[1]);
    //   return {
    //     note,
    //     highlight
    //   };
    // });
  });

  // sort by date, not relevance
  const sortedMatches = _.sortBy(matches, match => -1 * toMomentFromTimestamp(match.note.recorded_at).unix());


  // console.log('  out', out);
  return (
    <div style={{maxHeight: 120, overflowY: 'scroll'}}>
      {matches.map((match, index) => (
         <div key={index} style={{textAlign: 'left', fontSize: 10, marginBottom: 20}}>
          <div>
            <NoteBadge style={{display: 'inline-block'}} eventNoteTypeId={match.note.event_note_type_id} />
            <Timestamp style={{fontWeight: 'bold', display: 'inline', marginLeft: 5}} railsTimestamp={match.note.recorded_at} />
          </div>
          <div>{match.positions.map(position => (
            <span key={position[0]} style={{marginRight: 5}}>{createHighlight(match.note.text, position[0], position[1])}</span>
          ))}</div>
        </div>
      ))}
    </div>
  );
}


function createHighlight(text, start, length) {
  const highlight = text.slice(start, start + length);
  const beforeIndex = Math.max(start - 30, 0);
  const beforeContext = text.slice(beforeIndex, start);
  // console.log('beforeContext', beforeContext, beforeIndex, start);
  const afterIndex = Math.min(start + 30, text.length);
  const afterContext = text.slice(start + length, afterIndex);
  // console.log('afterContext', afterContext, start + length, afterIndex);

  // console.log('indexes:', start, length, beforeIndex, afterIndex);
  // console.log('contexts:', beforeContext, highlight, afterContext);
  // window.texts = (window.texts || []).concat(text); 
  return (
    <span>
      ...{beforeContext}<span style={{color: 'orange'}}>{highlight}</span>{afterContext}...
    </span>
  );
}