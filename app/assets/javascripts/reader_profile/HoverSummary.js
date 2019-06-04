import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

// UI for showing a summary when hovering over 
// part of the reading profile, in a somewhat similar
// style.
export default function HoverSummary(props) {
  const {name, atMoment, period, score, thresholds, concernKey} = props;
  const title = _.compact([
    name,
    '---------------------------------',
    `Freshness: ${atMoment ? atMoment.format('M/D/YY') : 'unknown'}`,
    (period ? `Period: ${period}` : null),
    ((score || thresholds) ? '' : null),
    (score ? `Score: ${score}` : null),
    (thresholds ? `Cut points: ${thresholds}` : null),
    concernKey ? `Concern: ${concernKey}` : null
  ]).join("\n");

  return <pre>{title}</pre>;
}
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
