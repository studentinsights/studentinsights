import React from 'react';
import _ from 'lodash';

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
