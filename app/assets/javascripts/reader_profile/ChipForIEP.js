import React from 'react';
import PropTypes from 'prop-types';
import lunr from 'lunr';
import _ from 'lodash';
import {toMoment} from '../helpers/toMoment';
import NoteText from '../components/NoteText';
import {Support, noteChipHeaderStyle, noteChipStyle} from './layout';
import Freshness from './Freshness';
import {FakeTooltip} from './Tooltip';
import {unrollAndSortPositions} from './TextSearchForReading';


export default class ChipForIEP extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {iepMatchPositions, iepFullText, style} = this.props;

    // date from IEP
    const matchStartDate = iepFullText.match(/IEP Begin Date:(\s+)([^\s]*)(\s+)IEP End Date/);
    const matchEndDate = iepFullText.match(/IEP End Date:(\s+)([^\s]*)(\s+)Parent and\/or Student Concerns/);
    const startMoment = matchStartDate ? toMoment(matchStartDate[2]) : null;
    const endMoment = matchEndDate ? toMoment(matchEndDate[2]) : null;
    const daysAgo = (endMoment)
      ? nowFn().clone().diff(endMoment, 'days')
      : null;

    // tooltip
    const tooltipText = (iepFullText.length > 512)
      ? (iepFullText.slice(0, 512) + '\n\n...')
      : iepFullText;
    return (
      <Freshness
        className="ChipForIEP"
        daysAgo={daysAgo}
        style={{height: '100%'}}
        innerStyle={{flexDirection: 'column'}}
      >
        <FakeTooltip
          tooltipStyle={{left: '20%', top: '20%'}}
          delayMs={1000}
          title={<NoteText text={tooltipText} style={{fontSize: 12, fontFamily: 'mono'}} />}
        >
          <div style={{...noteChipStyle, ...style}}>
            <div>
              <Support style={noteChipHeaderStyle}>IEP at-a-glance</Support>
              {startMoment && endMoment && (
                <div style={{display: 'inline', marginLeft: 10}}>
                  {startMoment.format('M/D/YY')} to {endMoment.format('M/D/YY')}
                </div>
              )}
            </div>
            <IepHighlights
              positions={iepMatchPositions}
              iepFullText={iepFullText}
            />
          </div>
        </FakeTooltip>
      </Freshness>
    );
  }
}
ChipForIEP.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
ChipForIEP.propTypes = {
  iepFullText: PropTypes.string.isRequired,
  iepMatchPositions: PropTypes.array.isRequired,
  style: PropTypes.object
};


// single doc for whole IEP
// TODO(kr) could divide into sections
export function buildLunrIndexForIEP(iepFullText) {
  const documents = [{
    id: 'full-iep-text',
    text: iepFullText
  }];
  return lunr(function() {
    this.ref('id');
    this.field('text');
    this.metadataWhitelist = ['position'];
    documents.forEach(doc => this.add(doc));
  });
}

export function findWithinIEP(lunrIndex, words) {
  const results = _.flatMap(words, word => lunrIndex.search(word));
  return unrollAndSortPositions(results);
}

// highlighting ALL search results, using lunr position data
function IepHighlights(props) {
  const {positions, iepFullText, style} = props;

  // use the highlight positioning data to collapse them all
  // into a stream of text with highlights
  const prefixSegments = (positions.length > 0 && _.first(positions)[0] > 0)
    ? [{ type: 'gap', previous: [0, 0], next: positions[0] }]
    : [];
  const segments = prefixSegments.concat(_.flatMap(positions, (position, index) => {
    return [
      { type: 'highlight', position },
      { type: 'gap', previous: position, next: positions[index + 1] }
    ];
  }));

  // elide unhighlighted sections, but for strings of text with
  // multiple highlights, show them all
  const text = iepFullText;
  const HALF_ELISION_LENGTH = 20;
  const els = segments.map((segment, index) => {
    if (segment.type === 'highlight') {
      const [start, length] = segment.position;
      return <span key={index} style={{color: 'orange'}}>{text.slice(start, start + length)}</span>;
    } else if (segment.type === 'gap') {
      const start = segment.previous[0] + segment.previous[1];
      const end = segment.next ? segment.next[0] : null;
      const gapText = text.slice(start, end);
      const elidedGapText = (gapText.length > (HALF_ELISION_LENGTH*2))
        ? gapText.slice(0, HALF_ELISION_LENGTH) + '...' + gapText.slice(-1*HALF_ELISION_LENGTH)
        : gapText;
      return <span key={index}>{elidedGapText}</span>;
    }
  });
  return <div className="IepHighlights" style={style}>{els}</div>;
}
IepHighlights.propTypes = {
  positions: PropTypes.arrayOf(PropTypes.array).isRequired,
  iepFullText: PropTypes.string.isRequired,
  style: PropTypes.object
};


//'  jifdso     \n\n\n\n   ji'.replace(/( +)/g, '$').replace(/\n\n(\n+)/g, '\n\n')
export function cleanedIepFullText(iepFullText) {
  return iepFullText
    .replace(/( +)/g, ' ') // multiple spaces
    .replace(/-\n\n(\w)/g, '-$1') // hyphenation
    .replace(/\n( +)(\w)/g, '\n$2') // indent after newline
    .replace(/([a-z])\n\n([a-z])/g, '$1$2') // no newlines cutting between sentences
    .replace(/\n\n(\n+)/g, '\n\n'); // newlines beyond 2
}
