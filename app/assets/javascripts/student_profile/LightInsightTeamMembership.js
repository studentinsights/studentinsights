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

    return (
      <LightInsightQuote
        className="LightInsightTeamMembership"
        quoteEl={
          <FitText
            minFontSize={12}
            maxFontSize={42}
            fontSizeStep={6}
            text={<span>{firstName} is on the <Team team={team} /> team</span>}
          />
        }
        sourceEl={<div>with coach {team.coach_text}</div>}
      />
    );
  }
}
LightInsightTeamMembership.propTypes = {
  firstName: PropTypes.string.isRequired,
  insightPayload: PropTypes.shape({
    activity_text: PropTypes.string.isRequired,
    coach_text: PropTypes.string.isRequired
  }).isRequired
};


export const TEAM_MEMBERSHIP_INSIGHT_TYPE = 'team_membership';
