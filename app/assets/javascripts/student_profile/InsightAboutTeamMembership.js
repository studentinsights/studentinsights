import React from 'react';
import PropTypes from 'prop-types';
import InsightQuote from './InsightQuote';
import Team from '../components/Team';
import FitText from '../components/FitText';


// Render an insight about sports team membership
export default class InsightAboutTeamMembership extends React.Component {
  render() {
    const {insightPayload, firstName} = this.props;
    const team = insightPayload;
    return (
      <InsightQuote
        className="InsightAboutTeamMembership"
        quoteEl={
          <FitText
            minFontSize={12}
            maxFontSize={42}
            fontSizeStep={6}
            text={team.active
              ? <span>{firstName} is on the <Team team={team} /> team</span>
              : <span>{firstName} was on the <Team team={team} /> team in {team.school_year_text}</span>
            }
          />
        }
        sourceEl={
          <div>
            <div>with coach {team.coach_text}</div>
            {team.active
              ? <div>this {team.season_key} season</div>
              : <div>during the {team.school_year_text} {team.season_key} season</div>
            }
          </div>
        }
      />
    );
  }
}
InsightAboutTeamMembership.propTypes = {
  firstName: PropTypes.string.isRequired,
  insightPayload: PropTypes.shape({
    activity_text: PropTypes.string.isRequired,
    season_key: PropTypes.string.isRequired,
    coach_text: PropTypes.string.isRequired,
    school_year_text: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired
  }).isRequired
};


export const ABOUT_TEAM_MEMBERSHIP = 'about_team_membership';
