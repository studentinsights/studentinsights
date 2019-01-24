import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import _ from 'lodash';
import hash from 'object-hash';
import chroma from 'chroma-js';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import MockStudentPhoto from '../components/MockStudentPhoto';
import Badge from '../components/Badge';
import Button from '../components/Button';
import FountasAndPinnellLevelChart, {classifyLevel} from './FountasAndPinnellLevelChart';
import {
  render504Chip,
  renderIepChip,
  renderEnglishLearnerChip,
  renderMtss
} from './chips';
import {
  DIBELS_DORF_WPM, 
  DIBELS_DORF_ACC,
  F_AND_P_ENGLISH,
  INSTRUCTIONAL_NEEDS,
  somervilleDibelsThresholdsFor,
  dibelsColor
} from './readingData';

const CELF = 'CELF';
const CELF_EXPRESSIVE_LANGUAGE_INDEX = 'CELF_EXPRESSIVE_LANGUAGE_INDEX';
const CELF_RECEPTIVE_LANGUAGE_INDEX = 'CELF_RECEPTIVE_LANGUAGE_INDEX';
const CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS = 'CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS';
const GORT = 'GORT';
const WJ = 'WJ';
const WIAT = 'WIAT';
const WIST = 'WIST';
const TOWRE = 'TOWRE';
const TOWRE_NONWORD_PHONEMIC_DECODING = 'TOWRE_NONWORD_PHONEMIC_DECODING';
const TOWRE_SIGHT_WORD_RECOGNITION = 'TOWRE_SIGHT_WORD_RECOGNITION';
const CTOPP = 'CTOPP';
const KBIT = 'KBIT';
const WRML = 'WRML';
const PPVT = 'PPVT';
const GORT_PASSAGE_FLUENCY = 'GORT_PASSAGE_FLUENCY';
const GORT_PASSAGE_COMPREHENSION = 'GORT_PASSAGE_COMPREHENSION';
const DIBELS_DAZE = 'DIBELS_DAZE';
const WJ_SINGLE_WORD_READING = 'WJ_SINGLE_WORD_READING';
const WIAT_SINGLE_WORD_READING = 'WIAT_SINGLE_WORD_READING';
const DIBELS_NWF_WPM = 'DIBELS_NWF_WPM';
const CTOPP_ELISION = 'CTOPP_ELISION';
const CTOPP_BLENDING = 'CTOPP_BLENDING';
// const RAN_RAS = 'RAN_RAS';
const RAN_LETTER_NAMING = 'RAN_LETTER_NAMING';
const WISC_PSI = 'WISC_PSI';
const WISC_WMI = 'WISC_WMI';

const labels = {
  [CELF]: 'CELF',
  [CELF_EXPRESSIVE_LANGUAGE_INDEX]: 'CELF Expressive language index', // expressive language index (index of multiple subtests)
  [CELF_RECEPTIVE_LANGUAGE_INDEX]: 'CELF Receptive language index', // receptive language index (index of multiple subtests)
  [CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS]: 'CELF Understanding spoken paragraphs', // subtest
  [GORT_PASSAGE_FLUENCY]: 'GORT Passage fluency', // passage fluency
  [GORT_PASSAGE_COMPREHENSION]: 'GORT Passage comprehension', // passage comprehension
  [DIBELS_DAZE]: 'DIBELS_DAZE',
  [WJ_SINGLE_WORD_READING]: 'WJ Single word reading', // single word reading
  [WIAT_SINGLE_WORD_READING]: 'WIAT Single word reading', // single word reading
  [DIBELS_DORF_WPM]: 'DIBELS Oral reading fluency', // oral reading fluency
  [DIBELS_NWF_WPM]: 'DIBELS Nonsense word fluency', // nonsense word fluency
  [TOWRE_NONWORD_PHONEMIC_DECODING]: 'TOWRE nonword phonemic decoding',
  [TOWRE_SIGHT_WORD_RECOGNITION]: 'TOWRE sight word recognition',
  [CTOPP_ELISION]: 'CTOPP elision',
  [CTOPP_BLENDING]: 'CTOPP blending',
  [RAN_LETTER_NAMING]: 'RAN Letter naming', // letter naming
  [WISC_PSI]: 'WISC Processing speed index', // processing speed index
  [WISC_WMI]: 'WISC Working memory index', // working memory index
  [WRML]: 'WRML',
  [PPVT]: 'Peabody picture vocabulary test'
};

const profiles = [
  {
    id: 1,
    name: 'Gabi, 8', 
    litKeys: [
      TOWRE,
      GORT,
      WIAT,
      WJ,
      WIST,
      CTOPP
    ]
  }, {
    id: 2,
    name: 'Obi, 8',
    litKeys: [
      CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS,
      WRML,
      TOWRE,
      GORT,
      WIAT,
      WJ,
      WIST,
      CTOPP,
      WISC_WMI,
      KBIT,
      WISC_PSI,
      KBIT
    ]
  }, {
    id: 3,
    name: 'Eduardo, 8',
    litKeys: [
      CELF_EXPRESSIVE_LANGUAGE_INDEX,
      TOWRE,
      GORT
    ]
  }, {
    id: 4,
    name: 'Damon, 8',
    litKeys: [
      CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS,
      PPVT,
      WRML,
      CELF_EXPRESSIVE_LANGUAGE_INDEX,
      GORT,
      WJ,
      WIAT
    ]
  }
];
export default class LitSidebarDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profileIndex: 0,
      selectedPanel: null
    };
  }

  onPanelClicked(panel) {
    this.setState({selectedPanel: panel});
  }

  render() {
    const {style, onClose} = this.props;
    const {profileIndex, selectedPanel} = this.state;
    const profile = profiles[profileIndex];

    return (
      <div className="LitSidebarDialog" style={{...styles.root, ...style}}>
        <Select
          value={profileIndex}
          onChange={item => this.setState({profileIndex: item.value})}
          options={profiles.map((profile, index) => {
            return {
              value: index,
              label: profile.name
            };
          })}
        />
        <div style={{position: 'relative', width: 1000, border: '1px solid black', background: 'white', padding: 10}}>
          <div style={styles.dialogHeading}>
            {/*<MockStudentPhoto
              style={styles.photo}
              student={student}
              fallbackEl={<span>😃</span>}
            />*/}
            <div style={styles.name}>{profile.name}</div>
            <div style={styles.close} onClick={onClose}>✕</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            {/*this.renderSidebar(profile)*/}
            <div style={{width: 800, padding: 10}}>
              {this.renderFramework(profile)}
            </div>
          </div>
          {selectedPanel && (
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              width: 280,
              background: '#f8f8f8',
              border: '1px solid #ccc',
              padding: 10,
              fontSize: 14
            }}>
              <div style={{marginTop: 10, fontWeight: 'bold', paddingBottom: 10}}>What tests are helpful?</div>
              <div>
                <ul style={{margin: 10}}>
                  {selectedPanel.benchmarkAssessmentKeys.map(benchmarkAssessmentKey => {
                    const text = labels[benchmarkAssessmentKey] || <span>{benchmarkAssessmentKey}?</span>;
                    return <li><a style={{display: 'block'}} href="#">{text}</a></li>;
                  })}
                </ul>
              </div>
              <div style={{marginTop: 50, fontWeight: 'bold', paddingBottom: 10}}>What helps students grow?</div>
              <div style={{display: 'flex', flexDirection: 'column', paddingBottom: 20}}>
                <textarea rows={3} style={{flex: 1, border: '1px solid #ccc'}}></textarea>
                <Button style={{marginTop: 5}}>Share</Button>
              </div>
              <div>
                {this.renderNote()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  renderNote() {
    return (
      <div style={{
        padding: 10,
        border: '1px solid #ddd',
        borderRadius: 3,
        background: 'white'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: 10}}>
          <a style={{fontWeight: 'bold'}} href="#">Kevin Robinson</a>
          <div style={{color: '#666'}}>6 days ago</div>
        </div>
        <div>I use something like lively letters for this, here's the materials I made: <a href="#">https://drive.google.com/folder/xyz</a></div>
        <div style={{display: 'flex', justifyContent: 'flex-end', paddingTop: 10}}>
          <Badge text="K5" backgroundColor="purple" />
        </div>
      </div>
    );
  }

  renderSidebar(profile) {
    const {student, doc, grade, benchmarkPeriodKey} = this.props;
    return (
      <div style={{flex: 1, padding: 10}}>
        <div style={styles.row}>
          <div style={styles.heading}>IEP, 504 or ELL plans</div>
          {this.renderChips(student)}
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>MTSS, last 2 years</div>
          {this.renderMtss()}
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>Instructional needs</div>
          {renderInstructionalNeeds(randomDoc(doc, profile.id, INSTRUCTIONAL_NEEDS))}
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>F&P level</div>
          {renderFountassAndPinnell(randomDoc(doc, profile.id, F_AND_P_ENGLISH))}
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>ORF accuracy</div>
          <div>{renderDibels(benchmarkPeriodKey, grade, doc, profile.id, DIBELS_DORF_ACC, '%')}</div>
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>ORF fluency</div>
          <div>{renderDibels(benchmarkPeriodKey, grade, doc, profile.id, DIBELS_DORF_WPM, 'wpm')}</div>
        </div>
        <div style={styles.row}>
          <div style={styles.heading}>STAR Reading (percentile)</div>
          {renderLatestStarReading(student)}
        </div>
      </div>
    );
  }

  renderFramework(profile) {
    return (
      <div style={styles.framework}>
        {this.renderCategory(profile, {
          title: 'Oral language',
          color: 'blue',
          panels: [{
            text: 'Listening comprehension',
            benchmarkAssessmentKeys: [CELF_UNDERSTANDING_SPOKEN_PARAGRAPHS]
          }, {
            text: 'Receptive language',
            benchmarkAssessmentKeys: [CELF_RECEPTIVE_LANGUAGE_INDEX]
          }, {
            text: 'Vocabulary',
            benchmarkAssessmentKeys: [CELF, PPVT]
          }, {
            text: 'Narrative memory',
            benchmarkAssessmentKeys: [WRML]
          }, {
            text: 'Expressive language',
            benchmarkAssessmentKeys: [CELF_EXPRESSIVE_LANGUAGE_INDEX]
          }]
        })}
        {this.renderCategory(profile, {
          color: 'red',
          title: 'Single Word and Connected Text',
          panels: [{
            text: 'Reading comprehension',
            benchmarkAssessmentKeys: [GORT, WJ, WIAT]
          }, {
            text: 'Fluency',
            benchmarkAssessmentKeys: [GORT, WJ, WIAT]
          }, {
            text: 'Basic reading',
            benchmarkAssessmentKeys: [GORT, WJ, WIAT]
          }]
        })}
        {this.renderCategory(profile, {
          color: 'orange',
          title: 'Retrieval and Reading Efficiency',
          panels: [{
            text: 'Single word reading efficiency',
            benchmarkAssessmentKeys: [TOWRE_SIGHT_WORD_RECOGNITION]
          }, {
            text: 'Phonemic decoding efficiency',
            benchmarkAssessmentKeys: [TOWRE_NONWORD_PHONEMIC_DECODING]
          }, {
            text: 'Rapid naming',
            benchmarkAssessmentKeys: [CTOPP, RAN_LETTER_NAMING]
          }]
        })}
        {this.renderCategory(profile, {
          color: 'green',
          title: 'Phonological',
          panels: [{
            text: 'Nonword decoding',
            benchmarkAssessmentKeys: [WJ, WIAT, WIST]
          }, {
            text: 'Phonological processing',
            benchmarkAssessmentKeys: [CTOPP_ELISION]
          }]
        })}
        {this.renderCategory(profile, {
          color: '#999',
          title: 'Cognitive',
          panels: [{
            text: 'Working memory',
            benchmarkAssessmentKeys: [WISC_WMI, KBIT]
          }, {
            text: 'Processing speed',
            benchmarkAssessmentKeys: [WISC_PSI, KBIT]
          }]
        })}
      </div>
    );
  }

  renderCategory(profile, props = {}) {
    const profileMap = profile.litKeys.reduce((map, key) => {
      return {...map, [key]: true};
    }, {});
    const {title, color, panels} = props;
    const fadedColor = chroma(color).alpha(0.5).css();
    return (
      <div style={styles.category}>
        <div style={{...styles.categoryTitle, backgroundColor: fadedColor}}>{title}</div>
        <div>
          {panels.map(panel => {
            const litKeys = panel.benchmarkAssessmentKeys.filter(key => profileMap[key]);
            return this.renderPanel({
              litKeys,
              color: fadedColor,
              category: panel.text,
              benchmarkAssessmentKeys: panel.benchmarkAssessmentKeys
            });
          })}
        </div>
      </div>
    );
  }

  renderPanel(panel) {
    const {litKeys, color, category, benchmarkAssessmentKeys} = panel;
    const litStyle = { backgroundColor: color };
    const litPanelStyle = (litKeys.length > 0)
      ? { backgroundColor: color }
      : { opacity: 0.2 };
    return (
      <div key={category} style={{...styles.panel, ...litPanelStyle}} onClick={this.onPanelClicked.bind(this, panel)} >
        <div style={styles.panelTitle}>{category}</div>
        <div>
          {benchmarkAssessmentKeys.map(benchmarkAssessmentKey => {
            const isLit = litKeys.indexOf(benchmarkAssessmentKey) !== -1;
            return (
              <div style={{
                ...styles.assessment,
                ...(isLit ? litStyle : {})
              }}>{labels[benchmarkAssessmentKey] || <span>{benchmarkAssessmentKey}?</span>}</div>
            );
          })}
        </div>
      </div>
    );
  }

  renderChips(student) {
    const {districtKey} = this.context;
    const chips = [
      renderIepChip(districtKey, student, {style: styles.chip}),
      render504Chip(districtKey, student, {style: styles.chip}),
      renderEnglishLearnerChip(districtKey, student, {style: styles.chip})
    ];
    if (_.compact(chips).length === 0) return none();
    return (
      <div style={{paddingLeft: 5}}>
        {chips.map((chip, index) => <div key={index}>{chip}</div>)}
      </div>
    );
  }

  renderMtss() {
    const {nowFn} = this.context;
    const {mtssNotesForStudent} = this.props;
    const mtssEl = renderMtss(mtssNotesForStudent, nowFn());
    return mtssEl ? <span style={{paddingLeft: 5}}>{mtssEl}</span> : none();
  }
}
LitSidebarDialog.contextTypes = {
  districtKey: PropTypes.string.isRequired,
  nowFn: PropTypes.func.isRequired
};
LitSidebarDialog.propTypes = {
  student: PropTypes.object.isRequired,
  mtssNotesForStudent: PropTypes.arrayOf(PropTypes.shape({
    student_id: PropTypes.number.isRequired,
    id: PropTypes.number.isRequired,
    recorded_at: PropTypes.string.isRequired,
  })).isRequired,
  doc: PropTypes.object.isRequired,
  grade: PropTypes.string.isRequired,
  benchmarkPeriodKey: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  style: PropTypes.object
};

const styles = {
  root: {
    fontSize: 12,
    background: '#333',
    height: 800,
    padding: 20
  },
  framework: {
    display: 'flex',
    flexDirection: 'row',
    margin: 20,
    marginTop: 0,
    borderRight: '1px solid #eee'
  },
  category: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    borderLeft: '1px solid #eee'
  },
  categoryTitle: {
    fontWeight: 'bold',
    padding: 10,
    minHeight: '5em'
  },
  panelTitle: {
    fontWeight: 'bold'
  },
  panel: {
    cursor: 'pointer',
    border: '1px solid #eee',
    margin: 5,
    padding: 5,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10
  },
  assessment: {
    padding: 10,
    margin: 5
  },
  photo: {
    maxWidth: 70,
    maxHeight: 90,
    marginRight: 10
  },
  name: {
    flex: 1,
    paddingRight: 10
  },
  row: {
    marginLeft: 5,
    marginBottom: 15
  },
  dialogHeading: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 16,
    borderBottom: '1px solid #ddd',
    marginBottom: 15
  },
  heading: {
    fontWeight: 'bold',
    marginBottom: 5
  },
  close: {
    padding: 10,
    cursor: 'pointer'
  },
  chip: {
    fontSize: 12,
    zIndex: 30
  }
};


function renderInstructionalNeeds(instructionalNeedsText) {
  return (
    <span style={{paddingLeft: 5}}>
      {instructionalNeedsText ? `“${instructionalNeedsText}”`: '(none entered)'}
    </span>
  );
}

function coloredBadge(value, color) {
  return (
    <div style={{
      display: 'flex',
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: 14,
      backgroundColor: color
    }}>{value}</div>
  );
}

function renderFountassAndPinnell(maybeLevel) {
  if (!maybeLevel) return none();
  const {color} = classifyLevel(maybeLevel);
  return (
    <div style={{paddingLeft: 5, display: 'flex', flexDirection: 'row'}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(maybeLevel, color)}
      </div>
      <FountasAndPinnellLevelChart
        height={40}
        markerWidth={4}
        style={{height: 40}}
        levels={[maybeLevel]}
        isForSingleFixedGradeLevel={true}
      />
    </div>
  );
}

function renderLatestStarReading(student) {
  if (student.star_reading_results.length === 0) return none();

  const latest = _.last(_.sortBy(student.star_reading_results, star => {
    return toMomentFromTimestamp(star.created_at).toDate().getTime();
  }));
  if (!latest.percentile_rank) return none();
  return <div style={{marginLeft: 5}}>{percentileWithSuffix(latest.percentile_rank)}</div>;
}


function percentileWithSuffix(percentile) {
  const lastDigit = _.last(percentile.toString());
  const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd'
  }[lastDigit] || 'th';
  return `${percentile}${suffix}`;
}


function renderDibels(benchmarkPeriodKey, grade, doc, studentId, benchmarkAssessmentKey, suffixEl) {
  const value = randomDoc(doc, studentId, benchmarkAssessmentKey);
  if (!value) return none();

  const thresholds = somervilleDibelsThresholdsFor(benchmarkAssessmentKey, grade, benchmarkPeriodKey);
  const color = dibelsColor(value, thresholds);
  return (
    <div style={{paddingLeft: 5}}>
      <div style={{display: 'inline-block', marginRight: 5}}>
        {coloredBadge(value, color)}
      </div>
      <span>{suffixEl}</span>
    </div>
  );
}


function none() {
  return <span style={{paddingLeft: 5}}>(none)</span>;
}


// swap in for readDoc
function randomDoc(doc, studentId, key) {
  if (key === DIBELS_DORF_WPM) return 50 + bucket(studentId, 50);
  if (key === DIBELS_DORF_ACC) return 80 + bucket(studentId, 20);
  if (key === F_AND_P_ENGLISH) {
    const range = 'Z'.charCodeAt() - 'A'.charCodeAt();
    const code = bucket(studentId, range);
    return String.fromCharCode('A'.charCodeAt() + code);
  }
  if (key === INSTRUCTIONAL_NEEDS) return '';
  return null;
}

function bucket(value, mod) {
  return parseInt(hash(value), 16) % mod;
}