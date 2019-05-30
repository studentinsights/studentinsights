import React from 'react';
import PropTypes from 'prop-types';
import Educator from '../components/Educator';
import LightInsightQuote, {Resizing, fontSizeStyle} from './LightInsightQuote';


// Render an insight from an educator (eg, from transition note).
// Not a "quote" from a student.
export default function InsightFromEducator(props) {
  const {promptText, responseText, educator, inWhatWhenEl} = props;
  return (
    <LightInsightQuote
      className="InsightFromEducator"
      quoteEl={
        <Resizing
          promptText={promptText}
          responseStyle={{fontStyle: 'italic'}}
          responseText={responseText}
        />
      }
      sourceEl={
        <div>
          <div>from <Educator style={fontSizeStyle} educator={educator} /></div>
          <div>{inWhatWhenEl}</div>
        </div>
      }
    />
  );
}
InsightFromEducator.propTypes = {
  promptText: PropTypes.string.isRequired,
  responseText: PropTypes.string.isRequired,
  educator: PropTypes.shape({
    id: PropTypes.number.isRequired,
    full_name: PropTypes.string.isRequired
  }).isRequired,
  inWhatWhenEl: PropTypes.node.isRequired
};
