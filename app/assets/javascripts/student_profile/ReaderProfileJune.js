import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import moment from 'moment';
import chroma from 'chroma-js';
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

export default class ReaderProfileJune extends React.Component {
  render() {
    const {student} = this.props;
    const {id} = student;
    return (
      <div className="ReaderProfileJune">
        <SectionHeading>Reader Profile (June)</SectionHeading>
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


    // return this.renderTable(notes, grade, currentSchoolYear, dataPointsByAssessmentKey);

    return this.renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey)
  }

  renderChart(notes, grade, currentSchoolYear, dataPointsByAssessmentKey) {
    return (
      <div style={{marginTop: 10}}>
        <Ingredient name="Engagement and identity" color="#ccc">
          <Sub name="within class" />
          <Sub name="outside school" />
        </Ingredient>
        <Ingredient name="Communicate with oral language" color="#ccc">
          <Sub name="expressive" />
          <Sub name="receptive" />
        </Ingredient>
        <Ingredient name="Speak and listen in English" color="#ccc">
          <Sub name="spoken" />
          <Sub name="written" />
        </Ingredient>
        <Ingredient name="Discriminate Sounds in Words" color="rgb(237, 141, 76)">
          <Sub
            name="blending"
            diagnostic="PAST"
            interventions="Heggerty" />
          <Sub
            name="deleting"
            diagnostic="PAST"
            interventions="Heggerty" />
          <Sub
            name="substituting"
            diagnostic="PAST"
            interventions="Heggerty" />
        </Ingredient>
        <Ingredient
          name="Represent Sounds with Letters"
          color="rgb(93, 214, 79)"
          childrenStyle={{borderBottom: '3px solid rgb(93, 214, 79)'}}>
          <Sub name="letters" diagnostic="Lively letters" />
          <Sub name="accurate" />
          <Sub name="fluent" />
          <Sub name="spelling" />
        </Ingredient>
      </div>
    );
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
      width: 160,
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
      width: 250
    };

    const isK = this.props.student.grade === 'KF';
    return (
      <div>
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
              {this.renderIngredientCell('Oral language, receptive', null, {...cell, backgroundColor: 'rgb(229, 240, 249)'})}
              <td style={{...cell, backgroundColor: 'rgb(229, 240, 249)'}}></td>
              <td style={{...cell, borderRight, backgroundColor: 'rgb(229, 240, 249)'}}></td>
              <td style={{...cell, ...chartSizing, backgroundColor: 'rgb(229, 240, 249)'}}>
              </td>
              <td style={{...cell, backgroundColor: 'rgb(229, 240, 249)'}}>
                <div>{fade('SPS Listening Comp')}</div>
              </td>
              <td style={{...notesCell, backgroundColor: 'rgb(229, 240, 249)'}}>{findNotes(this.props.student.grade,notes)}</td>
            </tr>
            <tr>
              {this.renderIngredientCell('Oral language, expressive', 'Talking Drawing', {...cell, backgroundColor: 'rgb(229, 240, 249)'})}
              <td style={{...cell, backgroundColor: 'rgb(229, 240, 249)'}}></td>
              <td style={{...cell, borderRight, backgroundColor: 'rgb(229, 240, 249)'}}></td>
              <td style={{...cell, ...chartSizing, backgroundColor: 'rgb(229, 240, 249)'}}>
              </td>
              <td style={{...cell, backgroundColor: 'rgb(229, 240, 249)'}}>
                <div>{fade('SPS Listening Comp')}</div>
              </td>
              <td style={{...notesCell, backgroundColor: 'rgb(229, 240, 249)'}}>{findNotes(this.props.student.grade,notes)}</td>
            </tr>
            {!isK ? <tr></tr> : (
              <tr>
                {this.renderIngredientCell('Word parts', 'SPS Phonological', cell)}
                <td style={cell}>{fade('PA in small group, second time')}</td>
                <td style={{...cell, borderRight}}>{fade('Heggerty')}</td>
                <td style={{...cell, ...chartSizing}}>
                  {this.renderDibels(DIBELS_FSF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
                  {this.renderDibels(DIBELS_PSF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
                </td>
                <td style={cell}>
                  <div>{fade('CTOPP, elision & blending')}</div>
                  <div>{fade(<a href="https://www.dropbox.com/home/ela%20folder/Phonological%20Awareness/Kindergarten?preview=Kindergarten+Student+Data+%26+Assessments.docx">PAST</a>)}</div>
                </td>
                <td style={notesCell}>{findNotes(this.props.student.grade,notes)}</td>
              </tr>
            )}
            {!isK ? <tr></tr> : (
              <tr>
                {this.renderIngredientCell('Letter Names', 'Fundations', cell)}
                <td style={cell}></td>
                <td style={{...cell, borderRight}}>{fade('Lively Letters')}</td>
                <td style={{...cell, ...chartSizing}}>
                  {this.renderDibels(DIBELS_LNF_WPM, currentSchoolYear, dataPointsByAssessmentKey, grade)}
                </td>
                <td style={cell}>
                  <div>{fade(<a href="https://www.dropbox.com/home/ela%20folder/Phonological%20Awareness/Kindergarten?preview=Kindergarten+Student+Data+%26+Assessments.docx">SPS RAN</a>)}</div>
                </td>
                <td style={notesCell}>{findNotes(this.props.student.grade,notes, LETTER_NAMES)}</td>
              </tr>
            )}
            {this.props.student.grade === '3' && (
              <tr>
                {this.renderIngredientCell('Phonics', '', cell)}
                <td style={cell}>{fade('ERI in small group')}</td>
                <td style={{...cell, borderRight}}></td>
                <td style={{...cell, ...chartSizing}}>
                  <div>DIBELS ORF</div>
                  <div>{fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=QuickPhonicsScreener.pdf">Quick Phonics Screener</a>)}</div>
                  <div>{fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=Decoding+Survey.pdf">Decoding Screener</a>)}</div>
                </td>
                <td style={cell}></td>
                <td style={notesCell}>{findNotes(this.props.student.grade,notes, LETTER_SOUNDS)}</td>
              </tr>
            )}
            {isK && (
              <tr>
                {this.renderIngredientCell('Phonics: Tapping and Blending Written Words', 'Fundations', cell)}
                <td style={cell}>{fade('ERI in small group')}</td>
                <td style={{...cell, borderRight}}></td>
                <td style={{...cell, ...chartSizing}}></td>
                <td style={cell}></td>
                <td style={notesCell}>{findNotes(this.props.student.grade,notes, LETTER_SOUNDS)}</td>
              </tr>
            )}
            <tr>
              {this.renderIngredientCell('Sight Words', isK ? 'Fundations' : '', cell)}
              <td style={cell}></td>
              <td style={{...cell, borderRight}}></td>
              <td style={{...cell, ...chartSizing}}></td>
              <td style={cell}></td>
              <td style={notesCell}>{findNotes(this.props.student.grade,notes)}</td>
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
              <td style={notesCell}>{findNotes(this.props.student.grade,notes)}</td>
            </tr>
            <tr>
              {this.renderIngredientCell('Working memory', null, {...cell, backgroundColor: 'rgb(255, 247, 233)'})}
              <td style={{...cell, backgroundColor: 'rgb(255, 247, 233)'}}></td>
              <td style={{...cell, borderRight, backgroundColor: 'rgb(255, 247, 233)'}}></td>
              <td style={{...cell, ...chartSizing, backgroundColor: 'rgb(255, 247, 233)'}}></td>
              <td style={{...cell, backgroundColor: 'rgb(255, 247, 233)'}}></td>
              <td style={{...notesCell, backgroundColor: 'rgb(255, 247, 233)'}}>{findNotes(this.props.student.grade,notes)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{marginTop: 30}}>
          <h1>older grades, or still need to add in somewhere</h1>
          <div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=QuickPhonicsScreener.pdf">Quick Phonics Screener</a>)}</div>
          <div>3rd, phonics screener: {fade(<a href="https://www.dropbox.com/home/ela%20folder/Small%20Group%20Instruction/Phonics%20Inventories?preview=Decoding+Survey.pdf">Decoding Screener</a>)}</div>
          <h2>other bits</h2>
          <div>sped eval from melissa's chart</div>
          <div>TOWRE in older grades?</div>
          <div>maybe CTOPP naming in older grades (instead of SPS RAN)?</div>
          <div>CELF maybe for older grades? speech eval?</div>
          <div>working memory: WISC-5 maybe in older grades? not K</div>
          <div></div>
        </div>
      </div>
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

ReaderProfileJune.propTypes = {
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

// function findNotes(this.props.student.grade,notesCell, words) {

//   if (!words) return null;

//   const bits = _.flatMap(notes, note => {
//     const matches = words.map(regex => regex.match(note.text));
// }

function findNotes(grade, notes, words) {
  if (grade !== 'KF') return null;

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
      {sortedMatches.map((match, index) => (
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

function Ingredient(props) {
  const {name, color, children, childrenStyle} = props;
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
        marginLeft: 15,
        marginRight: 15,
        paddingTop: 5,
        paddingLeft: 10,
        borderLeft: `3px solid ${color}`,
        borderRight: `1px solid ${color}`,
        ...childrenStyle
      }}>{children}</div>
    </div>
  );
}

function Sub(props) {
  const {name, screener, diagnostic, interventions, notes} = props;
  const nameCell = { width: 100, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' };
  const cell = { width: 200, height: 40, color: '#ccc' };
  return (
    <div className="Sub" style={{display: 'flex', flexDirection: 'row'}}>
      <div style={nameCell}>{name}</div>
      <div style={cell}>{screener || 'screener'}</div>
      <div style={cell}>{diagnostic || 'diagnostic'}</div>
      <div style={cell}>{interventions || 'interventions'}</div>
      <div style={cell}>{notes || 'notes'}</div>
    </div>
  );
}