import React from 'react';
import PropTypes from 'prop-types';
import OralReadingFluencyTab from './tabs/OralReadingFluencyTab';
import OralReadingFluencyView from './tabs/OralReadingFluencyView';
import LetterNamingFluencyTab from './tabs/LetterNamingFluencyTab';
import LetterNamingFluencyView from './tabs/LetterNamingFluencyView';
import FirstSoundFluencyTab from './tabs/FirstSoundFluencyTab';
import FirstSoundFluencyView from './tabs/FirstSoundFluencyView';
import PhonemicSegmentationFluencyTab from './tabs/PhonemicSegmentationFluencyTab';
import PhonemicSegmentationFluencyView from './tabs/PhonemicSegmentationFluencyView';


export default class ReaderProfileJanuary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rpKey: null
    };

    this.onTabSelected = this.onTabSelected.bind(this);
  }

  onTabSelected(rpKey) {
    this.setState({rpKey});
  }

  render() {
    const {rpKey} = this.state;
    return (
      <div>
        <div className="ReaderProfileJanuary-Tabs">
          {this.renderCategory("Student experience", [])}
          {this.renderCategory("Oral language", [])}
          {this.renderCategory("Phonological Awareness", [
            KEYS.FirstSoundFluency,
            KEYS.PhonemicSegmentationFluency
          ])}
          {this.renderCategory("Phonics Fluency", [
            KEYS.LetterNamingFluency,
            KEYS.OralReadingFluency
          ])}
          {this.renderCategory("Comprehension", [])}
        </div>
        {rpKey && this.renderExpandedView(rpKey)}
      </div>
    );
  }

  renderCategory(titleText, rpKeys) {
    return (
      <div className="ReaderProfileCategory">
        <h4>{titleText}</h4>
        <div>{rpKeys.map(this.renderTab, this)}</div>
      </div>
    );
  }

  renderTab(rpKey) {
    const {student, readerJson} = this.props;
    const tabProps = {
      student,
      readerJson
    };
    const {Tab} = componentsForReaderProfileKey(rpKey);
    return (
      <div key={rpKey} onClick={this.onTabSelected.bind(this, rpKey)}>
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
      <div className="ReaderProfileJanuary-Expanded">
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


const KEYS = {
  FirstSoundFluency: 'r:DIBELS_FSF',
  PhonemicSegmentationFluency: 'r:DIBELS_PSF',
  LetterNamingFluency: 'r:DIBELS_LNF',
  OralReadingFluency: 'r:DIBELS_ORF'
};
function componentsForReaderProfileKey(rpKey) {
  return {
    [KEYS.FirstSoundFluency]: {
      Tab: FirstSoundFluencyTab,
      View: FirstSoundFluencyView
    },
    [KEYS.PhonemicSegmentationFluency]: {
      Tab: PhonemicSegmentationFluencyTab,
      View: PhonemicSegmentationFluencyView
    },
    [KEYS.LetterNamingFluency]: {
      Tab: LetterNamingFluencyTab,
      View: LetterNamingFluencyView
    },
    [KEYS.OralReadingFluency]: {
      Tab: OralReadingFluencyTab,
      View: OralReadingFluencyView
    }
  }[rpKey];
}

 // // These keys define the categories of the reader profile.
// const CATEGORIES = {
//   ENGAGEMENT: 'c:ENGAGEMENT',
//   ORAL_LANGUAGE: 'c:ORAL_LANGUAGE',
//   PHONOLOGICAL_AWARENESS: 'c:PHONOLOGICAL_AWARENESS',
//   PHONICS_FLUENCY: 'c:PHONICS_FLUENCY',
//   COMPREHENSION: 'c:COMPREHENSION'
// };

// // This describes what should be shown in each category of the reader
// // profile, and the ordering.
// //
// // These are "reader profile keys" that can be used to look up
// // the React component to render for the tab or for the expanded view.
// const READER_PROFILE_KEYS_BY_CATEGORY = {
//   [CATEGORIES.ENGAGEMENT]: [],
//   [CATEGORIES.ORAL_LANGUAGE]: [
//     'r:ACCESS'
//   ],
//   [CATEGORIES.PHONOLOGICAL_AWARENESS]: [
//     'r:DIBELS_FSF',
//     'r:DIBELS_PSF'
//   ],
//   [CATEGORIES.PHONICS_FLUENCY]: [
//     'r:DIBELS_LNF',
//     'r:DIBELS_NWF',
//     'r:DIBELS_ORF'
//   ],
//   [CATEGORIES.COMPREHENSION]: [
//     'r:F_AND_P_ENGLISH',
//     'r:F_AND_P_SPANISH',
//     'r:STAR_READING'
//   ]
// };