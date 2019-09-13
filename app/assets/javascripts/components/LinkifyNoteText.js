import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';


// Adapted from NoteText.js
const noteText = {
  marginTop: 5,
  padding: 0,
  fontFamily: "'Open Sans', sans-serif",
  fontSize: 14,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  overflowX: 'hidden'
};


export default function LinkifyNoteText(props) {
  const {text, safeDomains, style} = props;
  const urls = _findURLsWithinText(safeDomains, text);
  const pieces = _join(text, urls);
  return (
    <div className="LinkifyNoteText" style={style || {}}>
      {pieces.map((piece, index) => {
        if (piece.text) {
          return <span key={index} style={noteText}>{piece.text}</span>;
        }

        if (piece.url) {
          return (
            <a
              key={index}
              href={piece.url}
              style={noteText}
              target="_blank"
              rel="noopener noreferrer"
            >
              {piece.url}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}

LinkifyNoteText.propTypes = {
  text: PropTypes.string.isRequired,
  style: PropTypes.object,
  safeDomains: PropTypes.arrayOf(PropTypes.string).isRequired
};
LinkifyNoteText.defaultProps = {
  safeDomains: [
    'docs.google.com',
    'drive.google.com'
  ]
};


// Exported only for tests
export function _join(text, urls) {
  if (text.length === 0) return [];

  // find first url
  const matches = urls.map(url => {
    return {url, index: text.indexOf(url)};
  });
  const match = _.min(matches.filter(match => match.index !== -1), 'index');
  if (!match) return [{text}];

  // split text
  const textBefore = text.slice(0, match.index);
  const textAfter = text.slice(match.index + match.url.length);

  // recur
  return _.compact([
    (textBefore.length > 0) ? {text: textBefore } : null,
    {url: match.url},
  ]).concat(_join(textAfter, urls));
}

// Exportd only for testing
export function _findURLsWithinText(safeDomains, text) {
  return _.flatMap(safeDomains, safeDomain => {
    const regex = new RegExp('https://' + escapeToUseAsRegexLiteral(safeDomain) + '[^\\s]*');
    const match = text.match(regex);
    return (match) ? match : [];
  });
}

function escapeToUseAsRegexLiteral(x) {
  return x.replace('?', '\\?');
}
