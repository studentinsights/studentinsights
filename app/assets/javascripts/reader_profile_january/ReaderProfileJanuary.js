import React from 'react';
import PropTypes from 'prop-types';
import AccessTab from './AccessTab';
import AccessView from './AccessView';
import OralReadingFluencyTab from './OralReadingFluencyTab';
import OralReadingFluencyView from './OralReadingFluencyView';
import LetterNamingFluencyTab from './LetterNamingFluencyTab';
import LetterNamingFluencyView from './LetterNamingFluencyView';
import FirstSoundFluencyTab from './FirstSoundFluencyTab';
import FirstSoundFluencyView from './FirstSoundFluencyView';
import PhonemicSegmentationFluencyTab from './PhonemicSegmentationFluencyTab';
import PhonemicSegmentationFluencyView from './PhonemicSegmentationFluencyView';


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

  onTabSelected(rpKey) {
    const updatedKey = (rpKey === this.state.rpKey) ? null : rpKey;
    this.setState({rpKey: updatedKey});
  }

  render() {
    const {rpKey} = this.state;
    return (
      <div className="ReaderProfileJanuary" style={styles.root}>
        <div style={styles.categories}>
          {this.renderCategory('Student experience', [])}
          {this.renderCategory('Oral language', [
            KEYS.ACCESS
          ])}
          {this.renderCategory('Phonological Awareness', [
            KEYS.FirstSoundFluency,
            KEYS.PhonemicSegmentationFluency
          ])}
          {this.renderCategory('Phonics Fluency', [
            KEYS.LetterNamingFluency,
            KEYS.OralReadingFluency
          ])}
          {this.renderCategory('Comprehension', [])}
        </div>
        {rpKey && this.renderExpandedView(rpKey)}
      </div>
    );
  }

  renderCategory(titleText, rpKeys) {
    const isFaded = (this.state.rpKey !== null && rpKeys.indexOf(this.state.rpKey) === -1);
    const categoryStyle = {
      ...styles.category,
      ...(isFaded ? styles.categoryFaded : {})
    };
    return (
      <div style={categoryStyle}>
        <div style={styles.categoryTitle}>{titleText}</div>
        <div style={styles.tabs}>
          {rpKeys.map(this.renderTab, this)}
        </div>
      </div>
    );
  }

  renderTab(rpKey) {
    const {student, readerJson} = this.props;
    const {grades, Tab} = componentsForReaderProfileKey(rpKey);
    if (grades.indexOf(student.grade) === -1) return null;

    const tabProps = {
      student,
      readerJson
    };
    return (
      <div key={rpKey} style={styles.tab} onClick={this.onTabSelected.bind(this, rpKey)}>
        <Tab {...tabProps} />
      </div>
    );
  }

  renderExpandedView(rpKey) {
    const {student, readerJson, instructionalStrategiesJson} = this.props;
    const expandedProps = {
      student,
      readerJson,
      instructionalStrategiesJson,
      onClose: this.onTabSelected.bind(this, null)
    };
    const {View} = componentsForReaderProfileKey(rpKey);
    return (
      <div style={styles.expanded}>
        <View {...expandedProps} />
      </div>
    );
  }
}

ReaderProfileJanuary.contextTypes = {
  nowFn: PropTypes.func.isRequired,
  districtKey: PropTypes.string.isRequired
};
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
  instructionalStrategiesJson: PropTypes.array.isRequired
};


const styles = {
  root: {
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
  categoryFaded: {
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
  tab: {
    border: '1px solid #eee',
    margin: 5,
    marginLeft: 0,
    marginRight: 10,
    padding: 5,
    borderRadius: 1,
    height: '3em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    cursor: 'pointer'
  },
  expanded: {
    margin: 10,
    border: '1px solid #333',
    padding: 10
  }
};




// Describes the different reader profile keys (assessments).
// These have components for a "Tab" and a "View" when clicked.
const KEYS = {
  ACCESS: 'r:ACCESS',
  FirstSoundFluency: 'r:DIBELS_FSF',
  PhonemicSegmentationFluency: 'r:DIBELS_PSF',
  LetterNamingFluency: 'r:DIBELS_LNF',
  OralReadingFluency: 'r:DIBELS_ORF'
};
function componentsForReaderProfileKey(rpKey) {
  return {
    [KEYS.ACCESS]: {
      grades: ['KF', '1', '2', '3', '4', '5'],
      Tab: AccessTab,
      View: AccessView
    },
    [KEYS.FirstSoundFluency]: {
      grades: ['KF', '1', '2'],
      Tab: FirstSoundFluencyTab,
      View: FirstSoundFluencyView
    },
    [KEYS.PhonemicSegmentationFluency]: {
      grades: ['KF', '1', '2'],
      Tab: PhonemicSegmentationFluencyTab,
      View: PhonemicSegmentationFluencyView
    },
    [KEYS.LetterNamingFluency]: {
      grades: ['KF', '1', '2'],
      Tab: LetterNamingFluencyTab,
      View: LetterNamingFluencyView
    },
    [KEYS.OralReadingFluency]: {
      grades: ['1', '2', '3', '4', '5'],
      Tab: OralReadingFluencyTab,
      View: OralReadingFluencyView
    }
  }[rpKey];
}
