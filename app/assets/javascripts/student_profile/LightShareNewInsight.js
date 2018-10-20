import React from 'react';
import PropTypes from 'prop-types';
import LightInsightQuote from './LightInsightQuote';


// For adding a new Insight
export default function LightShareNewInsight(props) {
  const {studentFirstName, style} = props;
  return (
    <LightInsightQuote
      quoteEl={
        <div>
          <div>Share an insight!</div>
          <textarea rows={3} style={{
            border: 0,
            background: '#f9f9f9',
            fontSize: 12,
            width: '100%',
            marginTop: 10
          }} placeholder={`What's one of ${studentFirstName}'s strengths?`} />
        </div>
      }
      sourceEl={<span>See <a href="#" style={style}>Ileana</a> or <a href="#" style={style}>Manuel</a> for examples.</span>}
    />
  );
}
LightShareNewInsight.propTypes = {
  studentFirstName: PropTypes.string.isRequired,
  style: PropTypes.object
};