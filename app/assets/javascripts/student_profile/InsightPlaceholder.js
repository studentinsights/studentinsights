import React from 'react';
import PropTypes from 'prop-types';
import InsightQuote, {fontSizeStyle} from './InsightQuote';
import {WebsiteInsightExample, Email} from '../components/PublicLinks';


// Showing a placeholder message with links to examples, faded out.
export default function InsightPlaceholder(props) {
  const {studentFirstName, style} = props;
  return (
    <InsightQuote
      style={{opacity: 0.5, ...style}}
      quoteEl={
        <div>
          <div style={{fontSize: 18, marginBottom: 5}}>Insights about {studentFirstName}</div>
          <div style={fontSizeStyle}>When you were the same age as your students, what would you have wanted adults to know about you?  Student voice surveys give young people power over how they are represented.</div>
        </div>
      }
      sourceEl={<span>See examples at <WebsiteInsightExample style={fontSizeStyle}/> and email <Email style={fontSizeStyle} /> to try this with your students.</span>}
    />
  );
}
InsightPlaceholder.propTypes = {
  studentFirstName: PropTypes.string.isRequired,
  style: PropTypes.object
};
