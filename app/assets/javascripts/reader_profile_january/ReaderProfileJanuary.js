import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {NoInformation} from './Tabs';
import HelpBubble from '../components/HelpBubble';
import {ReadingThresholdsGrid} from '../reading_debug/ReadingThresholdsPage';
import DebugReadingScheduleGrid from './DebugReadingScheduleGrid';
import AccessTab from './AccessTab';
import AccessView from './AccessView';
import NonsenseWordFluencyTab from './NonsenseWordFluencyTab';
import NonsenseWordFluencyView from './NonsenseWordFluencyView';
import OralReadingFluencyTab from './OralReadingFluencyTab';
import OralReadingFluencyView from './OralReadingFluencyView';
import LetterNamingFluencyTab from './LetterNamingFluencyTab';
import LetterNamingFluencyView from './LetterNamingFluencyView';
import FirstSoundFluencyTab from './FirstSoundFluencyTab';
import FirstSoundFluencyView from './FirstSoundFluencyView';
import PhonemeSegmentationFluencyTab from './PhonemeSegmentationFluencyTab';
import PhonemeSegmentationFluencyView from './PhonemeSegmentationFluencyView';
import FAndPEnglishTab from './FAndPEnglishTab';
import FAndPEnglishView from './FAndPEnglishView';
import StarReadingTab from './StarReadingTab';
import StarReadingView from './StarReadingView';


// This manages the frame and overall interaction of selection
// and the API for components describing different bits of
// info.
export default class ReaderProfileJanuary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rpKey: null
    };

    this.onTabSelected = this.onTabSelected.bind(this);
  }

  onTabSelected(rpKey, event) {
    event.preventDefault();
    event.stopPropagation();
    
    const updatedKey = (rpKey === this.state.rpKey) ? null : rpKey;
    this.setState({rpKey: updatedKey});
  }

  render() {
    return (
      <div className="ReaderProfileJanuary" style={styles.root}>
        <div style={styles.categories} onClick={this.onTabSelected.bind(this, null)}>
          {UI_PANELS.map(({titleText, rpKeys}) => this.renderCategory(titleText, rpKeys))}
        </div>
        {this.renderExpandedViewOrDebugAll()}
        {this.renderHistoryAndThresholds()}
      </div>
    );
  }

  renderHistoryAndThresholds() {
    const {readerJson, student} = this.props;
    return (
      <div style={styles.debug}>
        <HelpBubble
          teaser='history'
          linkStyle={styles.debugLink}
          title="Debug Reading Schedule Grid"
          content={
            <DebugReadingScheduleGrid
              readerJson={readerJson}
              gradeNow={student.grade}
            />
          }
        />
        <HelpBubble
          teaser='thresholds'
          linkStyle={styles.debugLink}
          title="Reading: Thresholds and Benchmarks"
          content={<ReadingThresholdsGrid />}
        />
      </div>
    );
  }

  renderCategory(titleText, rpKeys) {
    const isFaded = (this.state.rpKey !== null && rpKeys.indexOf(this.state.rpKey) === -1);
    const categoryStyle = {
      ...styles.category,
      ...(isFaded ? styles.faded : {})
    };
    return (
      <div key={titleText} style={categoryStyle}>
        <div style={styles.categoryTitle}>{titleText}</div>
        <div style={styles.tabs}>
          {this.renderTabsInterpretation(rpKeys)}
        </div>
      </div>
    );
  }

  renderTabsInterpretation(rpKeys) {
    const tabEls = _.compact(rpKeys.map(this.renderTab, this));
    if (tabEls.length === 0) {
      return <NoInformation />;
    } else {
      return tabEls;
    }
  }

  renderTab(rpKey) {
    const {student, readerJson} = this.props;
    const {grades, TabComponent} = componentsForReaderProfileKey(rpKey);
    if (grades.indexOf(student.grade) === -1) return null;

    const isFaded = (this.state.rpKey !== null && this.state.rpKey !== rpKey);
    return (
      <TabComponent
        style={isFaded ? styles.faded : {}}
        key={rpKey}
        student={student}
        readerJson={readerJson}
        onClick={this.onTabSelected.bind(this, rpKey)}
      />
    );
  }

  renderExpandedViewOrDebugAll() {
    const {debugShowAllExpandedViews} = this.props;
    const {rpKey} = this.state;
    const rpKeys = (debugShowAllExpandedViews)
      ? _.flatMap(UI_PANELS, p => p.rpKeys)
      : _.compact([rpKey]);
    return rpKeys.map(this.renderExpandedView, this);
  }

  renderExpandedView(rpKey) {
    const {student, readerJson, instructionalStrategies} = this.props;
    const expandedProps = {
      student,
      readerJson,
      instructionalStrategies,
      onClose: this.onTabSelected.bind(this, null)
    };
    const {ViewComponent} = componentsForReaderProfileKey(rpKey);
    return (
      <div key={rpKey} style={styles.expanded}>
        <ViewComponent {...expandedProps} />
      </div>
    );
  }
}
ReaderProfileJanuary.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    grade: PropTypes.any.isRequired
  }).isRequired,
  readerJson: PropTypes.shape({
    access: PropTypes.object,
    services: PropTypes.array.isRequired,
    iep_contents: PropTypes.object,
    feed_cards: PropTypes.arrayOf(PropTypes.object).isRequired,
    current_school_year: PropTypes.number.isRequired,
    benchmark_data_points: PropTypes.arrayOf(PropTypes.object).isRequired
  }).isRequired,
  instructionalStrategies: PropTypes.array.isRequired,
  debugShowAllExpandedViews: PropTypes.bool
};


const styles = {
  root: {
    position: 'relative',
    marginBottom: 40
  },
  categories: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10
  },
  category: {
    flex: 1
  },
  faded: {
    opacity: 0.2
  },
  categoryTitle: {
    fontSize: 16,
    marginRight: 10,
    height: '3em',
    lineHeight: '1.2em',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end'
  },
  tabs: {},
  expanded: {
    margin: 10,
    border: '1px solid #333',
    padding: 10
  },
  debug: {
    position: 'absolute',
    right: 0,
    top: 0
  },
  debugLink: {
    color: '#ccc',
    paddingRight: 10
  }
};




// Describes the different reader profile keys (which may be more general
// than the benchmark_assessment_key, and not exactly the same thing when
// an assessment reports multiple measures).
// These have components for a "Tab" and a "View" when clicked.
const KEYS = {
  ACCESS: 'r:ACCESS',
  FirstSoundFluency: 'r:DIBELS_FSF',
  PhonemeSegmentationFluency: 'r:DIBELS_PSF',
  LetterNamingFluency: 'r:DIBELS_LNF',
  NonsenseWordFluency: 'r:DIBELS_NWF',
  OralReadingFluency: 'r:DIBELS_ORF',
  StarReading: 'r:STAR_READING',
  FAndPEnglish: 'r:F_AND_P_ENGLISH'
};

// Define what to show in the UI
const UI_PANELS = [
  {
    titleText: 'Student experience',
    rpKeys: []
  },
  {
    titleText: 'Oral language',
    rpKeys: [
      KEYS.ACCESS
    ]
  },
  {
    titleText: 'Phonological Awareness',
    rpKeys: [
      KEYS.FirstSoundFluency,
      KEYS.PhonemeSegmentationFluency
    ]
  },
  {
    titleText: 'Phonics Fluency',
    rpKeys: [
      KEYS.LetterNamingFluency,
      KEYS.NonsenseWordFluency,
      KEYS.OralReadingFluency
    ]
  },
  {
    titleText: 'Comprehension',
    rpKeys: [
      KEYS.FAndPEnglish,
      KEYS.StarReading
    ]
  }
];


function componentsForReaderProfileKey(rpKey) {
  return {
    [KEYS.ACCESS]: {
      grades: ['KF', '1', '2', '3', '4', '5'],
      TabComponent: AccessTab,
      ViewComponent: AccessView
    },
    [KEYS.FirstSoundFluency]: {
      grades: ['KF', '1', '2'],
      TabComponent: FirstSoundFluencyTab,
      ViewComponent: FirstSoundFluencyView
    },
    [KEYS.PhonemeSegmentationFluency]: {
      grades: ['KF', '1', '2'],
      TabComponent: PhonemeSegmentationFluencyTab,
      ViewComponent: PhonemeSegmentationFluencyView
    },
    [KEYS.LetterNamingFluency]: {
      grades: ['KF', '1', '2'],
      TabComponent: LetterNamingFluencyTab,
      ViewComponent: LetterNamingFluencyView
    },
    [KEYS.NonsenseWordFluency]: {
      grades: ['KF', '1', '2', '3', '4'],
      TabComponent: NonsenseWordFluencyTab,
      ViewComponent: NonsenseWordFluencyView
    },
    [KEYS.OralReadingFluency]: {
      grades: ['1', '2', '3', '4', '5'],
      TabComponent: OralReadingFluencyTab,
      ViewComponent: OralReadingFluencyView
    },
    [KEYS.FAndPEnglish]: {
      grades: ['KF', '1', '2', '3', '4', '5'],
      TabComponent: FAndPEnglishTab,
      ViewComponent: FAndPEnglishView
    },
    [KEYS.StarReading]: {
      grades: ['2', '3', '4', '5'],
      TabComponent: StarReadingTab,
      ViewComponent: StarReadingView
    }
  }[rpKey];
}
