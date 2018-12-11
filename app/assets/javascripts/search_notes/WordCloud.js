import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import WordCloudLib from 'wordcloud';

// A word cloud visualization on canvas.  Tuning is tricky and
// context-sensitive.
export default class WordCloud extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {    
    const {words} = this.props;
    const filteredWords = cleaned(words);
    const list = _.toPairs(_.countBy(filteredWords));
    const weightFactor = Math.max(20, (filteredWords.length / 300));
    WordCloudLib(this.el, {
      list,
      weightFactor,
      color,
      shape: 'square',
      click: this.onClick
    });
  }

  onClick(e) {
    alert(`The word "${e[0]}" appears ${e[1]} times.`);
  }

  render() {
    const {width, height} = this.props;
    return (
      <canvas
        className="WordCloud"
        ref={el => this.el = el}
        style={{cursor: 'pointer'}}
        width={width}
        height={height}
      />
    );
  }
}
WordCloud.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  words: PropTypes.arrayOf(PropTypes.string).isRequired
};


function color(word, weight, fontSize, distance, theta) {
  return weight > 1 ? '#3177c9' : '#ccc';
}


function cleanWord(word) {
  return word
    .replace(/[+-,:\.\(\)]*$/,'')
    .replace(/^[+-,:\.\(\)]*/,'');

}
function cleaned(words) {
  return _.flatMap(words, word => {
    if (stopWords.indexOf(word.toLowerCase()) !== -1) return [];
    if (parseInt(word, 10).toString() === word) return [];
    if (word.length === 1) return [];
    return [cleanWord(word)];
  });
}
const stopWords = [
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "would",
  "should",
  "could",
  "ought",
  "i'm",
  "you're",
  "he's",
  "she's",
  "it's",
  "we're",
  "they're",
  "i've",
  "you've",
  "we've",
  "they've",
  "i'd",
  "you'd",
  "he'd",
  "she'd",
  "we'd",
  "they'd",
  "i'll",
  "you'll",
  "he'll",
  "she'll",
  "we'll",
  "they'll",
  "isn't",
  "aren't",
  "wasn't",
  "weren't",
  "hasn't",
  "haven't",
  "hadn't",
  "doesn't",
  "don't",
  "didn't",
  "won't",
  "wouldn't",
  "shan't",
  "shouldn't",
  "can't",
  "cannot",
  "couldn't",
  "mustn't",
  "let's",
  "that's",
  "who's",
  "what's",
  "here's",
  "there's",
  "when's",
  "where's",
  "why's",
  "how's",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very"
];
