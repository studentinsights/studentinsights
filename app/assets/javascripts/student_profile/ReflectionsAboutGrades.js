import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {toMomentFromTimestamp} from '../helpers/toMoment';
import DetailsSection from './DetailsSection';


// Renders insights from Q2 self-reflection, if any
export default class ReflectionsAboutGrades extends React.Component {
  render() {
    const {gradesReflectionInsights} = this.props;
    if (gradesReflectionInsights.length === 0) return null;
    
    const flattenedForm = _.first(gradesReflectionInsights).json.flattened_form_json;
    return (
      <div className="ReflectionsAboutGrades">
        <DetailsSection anchorId="reflections-about-grades" title="Self-reflection">
          <div style={{marginBottom: 15}}>
            <span>💬 From the "{flattenedForm.form_title}" student voice survey 💬</span>
            <span> on {toMomentFromTimestamp(flattenedForm.form_timestamp).format('M/D/YY')}</span>
          </div>
          {gradesReflectionInsights.map(({json}) => {
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
  gradesReflectionInsights: PropTypes.array.isRequired
};
