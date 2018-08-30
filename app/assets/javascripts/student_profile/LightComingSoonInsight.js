import React from 'react';
import PropTypes from 'prop-types';
import LightInsightQuote from './LightInsightQuote';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';


// Showing a "coming soon" kind of message with an example.
export default function LightComingSoonInsight(props) {
  const {studentFirstName, style} = props;

  return (
    <LightInsightQuote
      style={style}
      quoteEl={
        <div>
          <div style={{fontSize: 18, marginBottom: 5}}>Share an insight about {studentFirstName}</div>
          <div style={{fontSize: 12}}>This is being piloted at Somerville High School to start the 2018 school year.</div>
        </div>
      }
      sourceEl={
        <span>
          <span>If you're curious, talk with <a style={{fontSize: 12}} href="mailto:uharel@k12.somerville.ma.us">Uri</a> or check out an </span>
          <HelpBubble
            style={{marginLeft: 0}}
            modalStyle={modalFromRight}
            linkStyle={{fontSize: 12}}
            teaser="example"
            title="Example insight"
            content={renderSample(style)}
          />.</span>
      }
    />
  );
}
LightComingSoonInsight.propTypes = {
  studentFirstName: PropTypes.string.isRequired,
  style: PropTypes.object
};


function renderSample(style) {
  const SAMPLE_QUOTE_INDEX = 2;
  const {quote, tagline, source, withoutQuotes} = sampleQuotes()[SAMPLE_QUOTE_INDEX];
  const quoted = (withoutQuotes) ? quote : `“${quote}”`;
  return (
    <LightInsightQuote
      style={{...style, border: '1px solid #ccc'}}
      quoteEl={
        <div style={{flex: 1, fontSize: 20, overflowY: 'hidden'}}>{quoted}</div>
      }
      sourceEl={
        <div style={{fontSize: 12, color: '#333'}}>
          <div>{tagline}</div>
          <div>{source}</div>
        </div>
      }
    />
  );
}

function sampleQuotes() {  
  const quotes = [
    'Smart, very athletic, baseball, works w/uncle (carpenter)',
    'Truly bilingual in English & French',
    'Analytical and precise, really good at work with and keeping tracking of lots of details.  Enjoys baking at home and teaching her younger sister.',
    'Very social; gets along well w/adults and most kids'
  ];
  return quotes.map(quote => {
    const dateText = '6/15/18';
    const tagline = <span>from <b>Samwise Gamgee</b>, Counselor</span>;
    const source = <span>in <b>Transition note</b> on {dateText}</span>;
    return {quote, tagline, source};
  });
}