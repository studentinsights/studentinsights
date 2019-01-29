import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import DetailsSection from './DetailsSection';
import {IMPORTED_FORM_INSIGHT_TYPE} from './LightInsightImportedForm';


// Renders insights from Q2 self-reflection, if any
export default class ReflectionsAboutGrades extends React.Component {
  render() {
    const {profileInsights} = this.props;
    const reflectionInsights = profileInsights.filter(insight => {
      return (insight.type === IMPORTED_FORM_INSIGHT_TYPE && insight.json.form_key === 'shs_q2_self_reflection');
    });
    if (reflectionInsights.length === 0) return null;
    
    const flattenedForm = _.first(reflectionInsights).json.flattened_form_json;
    return (
      <div className="ReflectionsAboutGrades">
        <DetailsSection anchorId="reflections-about-grades" title="Self-reflection">
          <div style={{marginBottom: 15}}>
            <span>💬 From the "{flattenedForm.form_title}" student voice survey 💬</span>
            <span> on {toMomentFromTimestamp(flattenedForm.form_timestamp).format('M/D/YY')}</span>
          </div>
          {reflectionInsights.map(({json}) => {
            return (
              <div key={json.prompt_text} style={{marginBottom: 15}}>
                <div>{json.prompt_text}</div>
                <i>{json.response_text}</i>
              </div>
            );
          })}
        </DetailsSection>
      </div>
    );
  }
}
ReflectionsAboutGrades.propTypes = {
  profileInsights: PropTypes.array.isRequired
};
