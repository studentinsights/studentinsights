import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';


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


export default function Team({team, style}) {
  return (
    <span title={`${team.activity_text} with ${team.coach_text}`} style={style}>
      {parseTeam(team.activity_text)}
      <TeamIcon team={team} style={{paddingLeft: 5}} />
    </span>
  );
}
Team.propTypes = {
  team: PropTypes.shape({
    activity_text: PropTypes.string.isRequired,
    coach_text: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};


export function TeamIcon({team, style}) {
  const teamKey = team.activity_text;
  const emoji = TEAM_ICON_MAP[teamKey] || '🏅';
  return (
    <span
      title={`${team.activity_text} with ${team.coach_text}`}
      style={{cursor: 'default', ...style}}>
      {emoji}
    </span>
  );
}
TeamIcon.propTypes = {
  team: PropTypes.shape({
    activity_text: PropTypes.string.isRequired,
    coach_text: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};


export function parseTeam(activityText) {
  const level = parseTeamLevel(activityText);
  const sport = parseSport(activityText);
  return _.compact([level, sport]).join(' ');
}

function parseSport(activityText) {
  return activityText
    .replace(' - ', ' ')
    .replace('Boys', '')
    .replace('Girls', '')
    .replace('Varsity', '')
    .replace('JV', '')
    .replace('Freshman', '')
    .trim();
}

function parseTeamLevel(activityText) {
  if (activityText.indexOf('JV') !== -1) return 'JV';
  if (activityText.indexOf('Varsity') !== -1) return 'Varsity';
  if (activityText.indexOf('Freshman') !== -1) return 'Freshman';
  return '';
}