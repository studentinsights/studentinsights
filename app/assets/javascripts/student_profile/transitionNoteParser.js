const STRENGTHS_PROMPT = `What are this student's strengths?`;
const COMMUNITY_PROMPT = `What is this student's involvement in the school community like?`;
const PEERS_PROMPT = `How does this student relate to their peers?`;
const GUARDIAN_PROMPT = `Who is the student's primary guardian?`;
const OTHER_PROMPT = `Any additional comments or good things to know about this student?`;


function escapeToUseAsRegexLiteral(x) {
  return x.replace('?', '\\?');
}

function clean(text) {
  return text.trim().replace(/[\—\-\_]/g, '').trim();
}

function extractOne(text, beforeText, afterText = undefined) {
  const beforeRegexLiteral = escapeToUseAsRegexLiteral(beforeText);
  const afterRegexLiteral = (afterText)
    ? escapeToUseAsRegexLiteral(afterText)
    : '';
  const regex = new RegExp(beforeRegexLiteral + '([\\s\\S]*)' + afterRegexLiteral);
  const matches = text.match(regex);
  if (!matches) return null;
  return clean(matches[1]);
}

// See transition_note_parser.rb
function parseTransitionNoteText(transitionNoteText) {
  return {
    strengths: extractOne(transitionNoteText, STRENGTHS_PROMPT, COMMUNITY_PROMPT),
    community: extractOne(transitionNoteText, COMMUNITY_PROMPT, PEERS_PROMPT),
    peers: extractOne(transitionNoteText, PEERS_PROMPT, GUARDIAN_PROMPT),
    guardian: extractOne(transitionNoteText, GUARDIAN_PROMPT, OTHER_PROMPT),
    other: extractOne(transitionNoteText, OTHER_PROMPT)
  };
}

// Parse and re-render as text with whitespace etc. in a standard format.
export function parseAndReRender(transitionNoteText) {
  const {strengths, community, peers, guardian, other} = parseTransitionNoteText(transitionNoteText);
  const NEWLINE = "\n";
  return [
    STRENGTHS_PROMPT, NEWLINE, strengths, NEWLINE, NEWLINE,
    COMMUNITY_PROMPT, NEWLINE, community, NEWLINE, NEWLINE,
    PEERS_PROMPT, NEWLINE, peers, NEWLINE, NEWLINE,
    GUARDIAN_PROMPT, NEWLINE, guardian, NEWLINE, NEWLINE,
    OTHER_PROMPT, NEWLINE, other, NEWLINE, NEWLINE
  ].join('');
}
