import React from 'react';
import PropTypes from 'prop-types';

const TEAM_ICON_MAP = {
  'Competitive Cheerleading Varsity': '📣',
  'Cross Country - Boys Varsity': '👟',
  'Cross Country - Girls Varsity': '👟',
  'Football Varsity': '🏈',
  'Golf Varsity': '⛳',
  'Soccer - Boys Freshman': '⚽',
  'Soccer - Boys JV': '⚽',
  'Soccer - Boys Varsity': '⚽',
  'Soccer - Girls JV': '⚽',
  'Soccer - Girls Varsity': '⚽',
  'Volleyball - Girls Freshman': '🏐',
  'Volleyball - Girls JV': '🏐',
  'Volleyball - Girls Varsity': '🏐'
};

export default function TeamIcon({teamKey, style}) {
  const emoji = teamKey[TEAM_ICON_MAP] || '🏅';
  return <span style={style}>{emoji}</span>;
}
TeamIcon.propTypes = {
  teamKey: PropTypes.string.isRequired,
  style: PropTypes.object
};