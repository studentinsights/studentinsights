import React from 'react';
import PropTypes from 'prop-types';
import {prettyEnglishProficiencyText, hasAnyAccessData} from '../helpers/language';
import HelpBubble, {
  modalFromLeft,
} from '../components/HelpBubble';
import AccessPanel from './AccessPanel';


// Renders text or link about ELL status, with popup to see more if ELL or FLEP.
// Determine their status solely based on `limited_english_proficiency` field.
// Depending on what that is, there may be additional information from clicking.
export default class LanguageStatusLink extends React.Component {
  render() {
    const {districtKey} = this.context;
    const {limitedEnglishProficiency, access, style} = this.props;
    const el = <div style={style}>{prettyEnglishProficiencyText(districtKey, limitedEnglishProficiency, {access})}</div>;

    // Link to scores also if any access data (even if old)
    if (!hasAnyAccessData(districtKey, limitedEnglishProficiency)) return el;
    return (
      <HelpBubble
        style={{marginLeft: 0, display: 'block'}}
        teaser={el}
        linkStyle={style}
        modalStyle={{
          ...modalFromLeft,
          content: {
            ...modalFromLeft.content,
            width: 750
          }
        }}
        title="Language learning"
        content={<AccessPanel access={access} />}
      />
    );
  }
}
LanguageStatusLink.contextTypes = {
  districtKey: PropTypes.string.isRequired
};
LanguageStatusLink.propTypes = {
  limitedEnglishProficiency: PropTypes.string,
  access: PropTypes.object,
  style: PropTypes.object
};
LanguageStatusLink.defaultProps = {
  style: {}
};
