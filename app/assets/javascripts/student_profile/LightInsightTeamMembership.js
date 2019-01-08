import React from 'react';
import PropTypes from 'prop-types';
import LightInsightQuote from './LightInsightQuote';
import Team from '../components/Team';
import FitText from '../components/FitText';


// Render an insight about a strength from a transition note
export default class LightInsightTeamMembership extends React.Component {
  render() {
    const {insightPayload, firstName} = this.props;
    const team = insightPayload;
    const isOrWas = team.active ? 'is' : 'was';
    return (
      <LightInsightQuote
        className="LightInsightTeamMembership"
        quoteEl={
          <FitText
            minFontSize={12}
            maxFontSize={42}
            fontSizeStep={6}
            text={<span>{firstName} {isOrWas} on the <Team team={team} /> team</span>}
          />
        }
        sourceEl={
          <div>
            <div>with coach {team.coach_text}</div>
            <div>during the {team.season_key} season</div>
          </div>
        }
      />
    );
  }
}
LightInsightTeamMembership.propTypes = {
  firstName: PropTypes.string.isRequired,
  insightPayload: PropTypes.shape({
    activity_text: PropTypes.string.isRequired,
    season_key: PropTypes.string.isRequired,
    coach_text: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired
  }).isRequired
};


export const TEAM_MEMBERSHIP_INSIGHT_TYPE = 'team_membership';
