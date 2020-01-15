import React from 'react';
import PropTypes from 'prop-types';
import OralReadingFluencyTab from '../tabs/OralReadingFluencyTab';
// import NonsenseWordFluencyTab from '../tabs/NonsenseWordFluencyTab';
import LetterNamingFluencyTab from '../tabs/LetterNamingFluencyTab';
import FirstSoundFluencyTab from '../tabs/FirstSoundFluencyTab';
import PhonemicSegmentationTab from '../tabs/PhonemicSegmentationTab';


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
    const {readerJson, instructionalStrategiesJson} = this.props;
    const tabProps = {
      readerJson: readerJson,
      instructionalStrategiesJson,
      onSelect: this.onTabSelected
    };

    return (
      <div>
        <div className="ReaderProfileJanuary-Tabs">
          <Category titleText="Student experience" />
          <Category titleText="Oral language" />
          <Category titleText="Phonological Awareness">
            {this.renderPhonologicalAwarenessTabs(tabProps)}
          </Category>
          <Category titleText="Phonics Fluency">
            {this.renderPhonicsFluencyTabs(tabProps)}
          </Category>
          <Category titleText="Comprehension" />
        </div>
        {rpKey && this.renderExpandedView(rpKey)}
      </div>
    );
  }

  renderPhonologicalAwarenessTabs(tabProps) {
    return (
      <div>
        <FirstSoundFluencyTab {...tabProps} />
        <PhonemicSegmentationTab {...tabProps} />
      </div>
    );
  }

  renderPhonicsFluencyTabs(tabProps) {
    return (
      <div>
        <LetterNamingFluencyTab {...tabProps} />
        {/*<NonsenseWordFluencyTab {...tabProps} />*/}
        <OralReadingFluencyTab {...tabProps} />
      </div>
    );
  }

  renderExpandedView() {
    return 'expanded!';
    // return (
    //   <Expanded
    //     readerJson={readerJson}
    //     instructionalStrategiesJson={instructionalStrategiesJson}
    //     onClose={this.onTabSelected.bind(this, null)}
    //   />
    // );
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


class Category extends React.Component {
  render() {
    const {titleText, children} = this.props;
    return (
      <div className="ReaderProfileCategory">
        <h4>{titleText}</h4>
        <div>{children}</div>
      </div>
    );
  }
}
Category.propTypes = {
  titleText: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired
};




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