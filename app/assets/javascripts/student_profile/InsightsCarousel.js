import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import InsightPlaceholder from './InsightPlaceholder';
import InsightFromFirstTransitionNoteStrength, {FROM_FIRST_TRANSITION_NOTE_STRENGTH} from './InsightFromFirstTransitionNoteStrength';
import InsightFromFirstStudentVoiceSurvey, {FROM_FIRST_STUDENT_VOICE_SURVEY} from './InsightFromFirstStudentVoiceSurvey';
import InsightFromGenericImportedForm, {FROM_GENERIC_IMPORTED_FORM} from './InsightFromGenericImportedForm';
import InsightAboutTeamMembership, {ABOUT_TEAM_MEMBERSHIP} from './InsightAboutTeamMembership';
import InsightFromBedfordTransition, {FROM_BEDFORD_TRANSITION} from './InsightFromBedfordTransition';


// A component that rotates through the `quotes` passed.
export default class InsightsCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      insightToRenderIndex: 0
    };
    this.onIntervalTicked = this.onIntervalTicked.bind(this);
    this.onNext = this.onNext.bind(this);
    this.resetInterval = this.resetInterval.bind(this);
  }

  componentDidMount() {
    this.resetInterval();
  }

  componentWillUnmount() {
    this.clearInterval();
  }

  clearInterval() {
    if (this.interval) window.clearInterval(this.interval);
  }

  resetInterval() {
    this.clearInterval();
    this.interval = window.setInterval(this.onIntervalTicked, 8000);
  }

  // Insights that we know how to render
  insightsThatCanBeRendered() {
    const {student, profileInsights} = this.props;
    return _.compact(profileInsights.map(insight => {
      return renderInsightByType(student, insight);
    }));
  }

  onIntervalTicked() {
    const {insightToRenderIndex} = this.state;
    const insightsThatCanBeRendered = this.insightsThatCanBeRendered();
    const nextIndex = (insightToRenderIndex + 1 >= insightsThatCanBeRendered.length)
      ? 0
      : insightToRenderIndex + 1;
    this.setState({ insightToRenderIndex: nextIndex });
  }

  onNext(e) {
    e.preventDefault();
    this.onIntervalTicked();
    this.resetInterval();
  }

  render() {
    const {style, student} = this.props;
    const {insightToRenderIndex} = this.state;
    const insightsThatCanBeRendered = this.insightsThatCanBeRendered();

    return (
      <div className="InsightsCarousel" style={{...styles.root, ...style}}>
        {(insightsThatCanBeRendered.length > 0)
          ? insightsThatCanBeRendered[insightToRenderIndex]
          : <InsightPlaceholder studentFirstName={student.first_name} />
        }
        {insightsThatCanBeRendered.length > 1 && (
          <div style={styles.rotating}>
            <div>{insightToRenderIndex + 1} / {insightsThatCanBeRendered.length}</div>
            <a style={styles.moreLink} href="#" onClick={this.onNext}>more</a>
          </div>
        )}
      </div>
    );
  }
}
InsightsCarousel.propTypes = {
  profileInsights: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string.isRequired,
    json: PropTypes.object.isRequired
  })).isRequired,
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    first_name: PropTypes.string.isRequired,
    last_name: PropTypes.string.isRequired
  }).isRequired,
  style: PropTypes.object
};

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: '#eee',
    position: 'relative'
  },
  rotating: {
    position: 'absolute',
    textAlign: 'right',
    fontSize: 12,
    right: 15,
    bottom: 15,
    background: '#eee'
  },
  moreLink: {
    display: 'inline-block',
    fontSize: 12,
  }
};


// Silently ignore unexpected types
// See profile_insights.rb
function renderInsightByType(student, insight, options = {}) {
  const insightPayload = insight.json;
  const insightType = insight.type;
  
  if (insightType === FROM_FIRST_TRANSITION_NOTE_STRENGTH) return (
    <InsightFromFirstTransitionNoteStrength
      student={student}
      insightPayload={insightPayload}
    />
  );

  if (insightType === ABOUT_TEAM_MEMBERSHIP) return (
    <InsightAboutTeamMembership firstName={student.first_name} insightPayload={insightPayload} />
  );

  if (insightType === FROM_FIRST_STUDENT_VOICE_SURVEY) return (
    <InsightFromFirstStudentVoiceSurvey
      student={student}
      insightPayload={insightPayload} 
    />
  );

  if (insightType === FROM_GENERIC_IMPORTED_FORM) return (
    <InsightFromGenericImportedForm
      student={student}
      insightPayload={insightPayload} 
    />
  );

  if (insightType === FROM_BEDFORD_TRANSITION) return (
    <InsightFromBedfordTransition
      student={student}
      insightPayload={insightPayload} 
    />
  );

  return null;
}
