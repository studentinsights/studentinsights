import React from 'react';
import PropTypes from 'prop-types';
import Hover from '../components/Hover';


// Fade out the components based on how many `daysAgo`
// the information is from.  Add a `Hover` to show full
// opacity on hover.
export default function Freshness(props) {
  const {daysAgo, style, innerStyle, children} = props;
  const freshnessStyle = stylesForFreshness(daysAgo);
  return (
    <Hover style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flex: 1,
      ...style
    }}>{isHovering => (
      <div style={{
        ...innerStyle,
        height: '100%',
        width: '100%',
        display: 'flex',
        flex: 1,
        ...(isHovering ? {} : freshnessStyle)
      }}>{children}</div>
    )}</Hover>
  );
}
Freshness.propTypes = {
  daysAgo: PropTypes.number,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  innerStyle: PropTypes.object
};


const FRESHNESS_MONTHS = 'freshness_months';
const FRESHNESS_YEARS = 'freshness_years';
const FRESHNESS_OLD = 'freshness_old';
const FRESHNESS_UNKNOWN = 'freshness_unknown';

function stylesForFreshness(daysAgo) {
  const bucket = bucketForChip(daysAgo);
  return {
    [FRESHNESS_MONTHS]: {opacity: 1.0},
    [FRESHNESS_UNKNOWN]: {opacity: 0.8},
    [FRESHNESS_YEARS]: {opacity: 0.4},
    [FRESHNESS_OLD]: {opacity: 0.2}
  }[bucket];
}

function bucketForChip(daysAgo) {
  if (daysAgo === null || daysAgo ===  undefined) return FRESHNESS_UNKNOWN;
  if (daysAgo <= 90) return FRESHNESS_MONTHS;
  if (daysAgo <= 365) return FRESHNESS_YEARS;
  return FRESHNESS_OLD;
}

