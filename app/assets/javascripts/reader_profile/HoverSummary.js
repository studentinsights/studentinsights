import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import NoteText from '../components/NoteText';


// UI for showing a summary when hovering over 
// part of the reading profile, in a somewhat similar
// style.
export default class HoverSummary extends React.Component {
  render() {
    const {nowFn} = this.context;
    const {name, atMoment, period, score, thresholds, concernKey} = this.props;

    const daysAgoText = atMoment
      ? `${nowFn().clone().diff(atMoment, 'days')} days ago`
      : `unknown`;
    const title = _.compact([
      `Freshness: ${daysAgoText}`,
      (period ? `Period: ${period}` : null),
      ((score || thresholds) ? '' : null),
      (score ? `Score: ${score}` : null),
      (thresholds ? `Cut points: ${thresholds}` : null),
      concernKey ? `Concern: ${concernKey}` : null
    ]).join("\n");

    return (
      <div>
        <h3 style={{paddingBottom: 3, borderBottom: '1px solid #999'}}>{name}</h3>
        <NoteText text={title} />
      </div>
    );
  }
}
HoverSummary.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
HoverSummary.propTypes = {
  name: PropTypes.node.isRequired,
  atMoment: PropTypes.object,
  period: PropTypes.string,
  score: PropTypes.any,
  thresholds: PropTypes.string,
  concernKey: PropTypes.string
};


export function secondLineDaysAgo(daysAgo, width) {
  if (daysAgo === null || daysAgo === undefined) return null;
  return (width > 80)
    ? `${daysAgo} days ago`
    : `${daysAgo}d`;
}

export function thresholdsExplanation(thresholds) {
  return (thresholds)
    ? `risk <= ${thresholds.risk} / benchmark >= ${thresholds.benchmark}`
    : null;
}
