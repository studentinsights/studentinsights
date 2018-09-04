import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import LightComingSoonInsight from './LightComingSoonInsight';
import LightInsightTransitionNoteStrength, {TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE} from './LightInsightTransitionNoteStrength';
import LightInsightStudentVoiceSurveyResponse, {STUDENT_VOICE_SURVEY_RESPONSE_INSIGHT_TYPE} from './LightInsightStudentVoiceSurveyResponse';


// A component that rotates through the `quotes` passed.
export default class LightCarousel extends React.Component {
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
    this.interval = window.setInterval(this.onIntervalTicked, 10000);
  }

  // Insights that we know how to render
  insightsThatCanBeRendered() {
    const {profileInsights} = this.props;
    return _.compact(profileInsights.map(insight => this.renderInsightByType(insight)));
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
      <div className="LightCarousel" style={{...styles.root, ...style}}>
        {(insightsThatCanBeRendered.length > 0)
          ? insightsThatCanBeRendered[insightToRenderIndex]
          : <LightComingSoonInsight studentFirstName={student.first_name} />
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

  // Silently ignore unexpected types
  renderInsightByType(insight, options = {}) {
    const {student} = this.props;
    const insightPayload = insight.json;
    const insightType = insight.type;
    
    if (insightType === TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE) return (
      <LightInsightTransitionNoteStrength insightPayload={insightPayload} />
    );

    if (insightType === STUDENT_VOICE_SURVEY_RESPONSE_INSIGHT_TYPE) return (
      <LightInsightStudentVoiceSurveyResponse
        student={student}
        insightPayload={insightPayload} 
      />
    );

    return null;
  }
}
LightCarousel.propTypes = {
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
