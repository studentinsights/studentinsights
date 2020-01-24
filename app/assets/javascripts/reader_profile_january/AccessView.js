import React from 'react';
import PropTypes from 'prop-types';
import expandedViewPropTypes from './expandedViewPropTypes';
import {oralLanguageMaterialsFileKeys} from './accessParsing';
import {matchStrategies, ORAL_LANGUAGE} from './instructionalStrategies';
import ExpandedLayout from './ExpandedLayout';
import MaterialsCarousel from './MaterialsCarousel';
import Strategies from './Strategies';
import AccessPanel from '../student_profile/AccessPanel';


export default class AccessView extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {student, onClose, readerJson, instructionalStrategies} = this.props;
    const fileKeys = oralLanguageMaterialsFileKeys(readerJson.access, student.grade, nowFn());
    const strategies = matchStrategies(instructionalStrategies, student.grade, ORAL_LANGUAGE);
    return (
      <ExpandedLayout
        titleText="ACCESS oral language"
        studentFirstName={student.first_name}
        onClose={onClose}
        materialsEl={<MaterialsCarousel fileKeys={fileKeys} />}
        strategiesEl={<Strategies strategies={strategies} />}
        dataEl={this.renderData()}
        
      />
    );
  }

  renderData() {
    const {student, readerJson} = this.props;
    return (
      <div style={styles.container}>
        <div style={styles.scaled}>
          <AccessPanel
            studentFirstName={student.first_name}
            ellTransitionDate={student.ell_transition_date}
            limitedEnglishProficiency={student.limited_english_proficiency}
            access={readerJson.access}
          />
        </div>
      </div>
    );
  }
}
AccessView.propTypes = expandedViewPropTypes;
AccessView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};


const styles = {
  container: {
    width: 330,
    overflow: 'hidden'
  },
  scaled: {
    width: 660,
    transform: 'scale(0.5)',
    transformOrigin: 'top left'
  }
};
