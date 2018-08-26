import React from 'react';
import PropTypes from 'prop-types';
import LightShareNewInsight from './LightShareNewInsight';
import LightInsightTransitionNoteStrength, {TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE} from './LightInsightTransitionNoteStrength';


// A component that rotates through the `quotes` passed.
export default class LightCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
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

  onIntervalTicked() {
    const {index} = this.state;
    const {insights} = this.props;
    const nextIndex = (index + 1 >= insights.length) ? 0 : index + 1;
    this.setState({ index: nextIndex });
  }

  onNext() {
    this.onIntervalTicked();
    this.resetInterval();
  }

  render() {
    const {style, insights, studentFirstName} = this.props;
    const {index} = this.state;

    const buttonEl = (insights.length > 1)
      ? <div style={styles.link} onClick={this.onNext}>more</div>
      : null;

    return (
      <div className="LightCarousel" style={{...styles.root, ...style}}>
        {(insights.length > 0)
          ? this.renderInsightByType(insights[index], {buttonEl})
          : <LightShareNewInsight studentFirstName={studentFirstName} />
        }
      </div>
    );
  }

  renderInsightByType(insight, options = {}) {
    const {educatorsIndex} = this.props;
    const {insightType, insightPayload} = insight;
    if (insightType === TRANSITION_NOTE_STRENGTH_INSIGHT_TYPE) {
      return (
        <LightInsightTransitionNoteStrength
          insightPayload={insightPayload}
          educatorsIndex={educatorsIndex}
          insightStyle={{fontSize: 12}}
        />
      );
    }

  }
}
LightCarousel.propTypes = {
  insights: PropTypes.array.isRequired,
  educatorsIndex: PropTypes.object.isRequired,
  studentFirstName: PropTypes.string.isRequired,
  style: PropTypes.object,
  insightStyle: PropTypes.object,
};

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  }
};
