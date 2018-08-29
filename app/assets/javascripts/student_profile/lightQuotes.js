import React from 'react';
import _ from 'lodash';
import {toMomentFromRailsDate, toMomentFromTimestamp} from '../helpers/toMoment';
import Educator from '../components/Educator';
import HelpBubble, {modalFromRight} from '../components/HelpBubble';
import NoteCard from './NoteCard';
import {badgeStyle} from './NotesList';
import {parseTransitionNoteText, parseAndReRender} from './lightTransitionNotes';
import {studentProfileQuoteUpsell} from '../helpers/PerDistrict';

export function sampleQuotes(style) {
  const quotes = [
    'Smart, very athletic, baseball, works w/uncle (carpenter)',
    'Truly bilingual in English & French',
    'Analytical and precise, really good at work with keeping tracking of lots of details.  Enjoys baking at home and teaching her younger sister.',
    'Very social; gets along well w/adults and most kids'
  ];
  return quotes.map(quote => {
    const dateText = '6/15/18';
    const tagline = <span>from <b>Samwise Gamgee</b>, Counselor</span>;
    const source = <span>in <b>Transition note</b> on {dateText}</span>;
    return {quote, tagline, source};
  });
}

export function quotesFrom(transitionNotes, educatorsIndex, style) {
  const safeNotes = transitionNotes.filter(transitionNote => !transitionNote.is_restricted);

  return _.flatten(safeNotes.map(note => {
    const dateText = toMomentFromTimestamp(note.created_at).format('M/D/YY');
    const educator = educatorsIndex[note.educator_id] || educatorsIndex[_.keys(educatorsIndex)[0]];
    const tagline = <span>from <Educator style={style} educator={educator} /></span>;
    const source = (
      <span>
        <span>in</span>
        <HelpBubble
          style={{marginLeft: 5, marginRight: 5}}
          modalStyle={modalFromRight}
          linkStyle={style}
          teaser="Transition note"
          title="Transition note"
          content={renderTransitionNote(note, educator)}
        />
        <span>on {dateText}</span>
      </span>
    );

    // only strengths for now
    const noteParts = parseTransitionNoteText(note.text);
    const quote = noteParts.strengths;
    if (!quote || quote.length === 0) return [];
    return [{quote, source, tagline}];
  }));

}


export function upsellQuotes(student, style) {
  const {districtKey} = this.context;
  const quoteUpsell = studentProfileQuoteUpsell(districtKey);

  return [{
    quote: (
      <div>
        <div style={{fontSize: 18, marginBottom: 5}}>Share an insight about {student.first_name}</div>
        <div style={style}>{quoteUpsell}</div>
      </div>
    ),
    withoutQuotes: true,
    tagline: <span>If you're curious, talk with <a style={style} href="mailto:uharel@k12.somerville.ma.us">Uri</a> or check out </span>,
    source: (
      <span>an <HelpBubble
        style={{marginLeft: 0}}
        modalStyle={modalFromRight}
        linkStyle={style}
        teaser="example"
        title="Example insight"
        content={renderSample(sampleQuotes(style)[2], style)}
      />.</span>
    )
  }];
}

function renderSample(quoteItem, style) {
  const {quote, tagline, source, withoutQuotes} = quoteItem;
  const quoted = (withoutQuotes) ? quote : `“${quote}”`;
  return (
    <div style={{display: 'flex', flex: 1, flexDirection: 'column', justifyContent: 'space-between', ...style}}>
      <div style={{flex: 1, margin: 20, marginBottom: 0, marginTop: 15, display: 'flex'}}>
        <div style={{flex: 1, fontSize: 20, overflowY: 'hidden'}}>{quoted}</div>
      </div>
      <div style={{
        fontSize: 12,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        margin: 20,
        marginTop: 10,
        marginBottom: 15
      }}>
        <div>
          <div style={{fontSize: 12, color: '#333'}}>
            <div>{tagline}</div>
            <div>{source}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Look similar to profile view
function renderTransitionNote(transitionNote, educator) {
  return (
    <NoteCard
      noteMoment={toMomentFromRailsDate(transitionNote.created_at)}
      badge={<span style={badgeStyle}>Transition note</span>}
      educatorId={educator.id}
      text={parseAndReRender(transitionNote.text)}
      educatorsIndex={{[educator.id]: educator}}
      attachments={[]} />
  );
}
