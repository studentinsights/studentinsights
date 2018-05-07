import React from 'react';
import Circle from '../components/Circle';
import Button from '../components/Button';

// Shows progress through a set of steps for the classroom creator process.
// This also controls the navigation buttons
export default class HorizontalStepper extends React.Component {
  constructor(props) {
    super(props);

    this.onStepChanged = this.onStepChanged.bind(this);
    this.onPreviousClicked = this.onPreviousClicked.bind(this);
    this.onNextClicked = this.onNextClicked.bind(this);
  }

  onStepChanged(stepIndex) {
    const {onStepChanged, availableSteps} = this.props;
    if (availableSteps.indexOf(stepIndex) === -1) return;
    onStepChanged(stepIndex);
  }

  onPreviousClicked() {
    const {stepIndex} = this.props;
    this.onStepChanged(stepIndex - 1);
  }

  onNextClicked() {
    const {stepIndex} = this.props;
    this.onStepChanged(stepIndex + 1);
  }

  render() {
    const {steps, availableSteps, isEditable, renderFn, style, contentStyle} = this.props;
    const currentStepIndex = this.props.stepIndex;
    return (
      <div className="HorizontalStepper" style={{...styles.root, ...style}}>
        <div style={styles.banner}>
          {steps.map((step, stepIndex) => {
            return (
              <span
                key={stepIndex}
                style={this.renderStyleForBannerItem(stepIndex, currentStepIndex, availableSteps)}
                onClick={this.onStepChanged.bind(this, stepIndex)}>
                <Circle
                  text={`${stepIndex+1}`}
                  color={this.renderColorForCircle(stepIndex, availableSteps)}
                  style={{verticalAlign: 'middle'}}/>
                <span style={styles.bannerText}>{step}</span>
              </span>
            );
          })}
          {isEditable && <div>readonly</div>}
        </div>
        <div style={{...styles.content, ...contentStyle}}>
          {renderFn(currentStepIndex, steps[currentStepIndex])}
        </div>
        {this.renderNavigationButtons()}
      </div>
    );
  }

  renderColorForCircle(index, availableSteps) {
    return (availableSteps.indexOf(index) !== -1)
      ? '#3177c9'
      : '#ccc';
  }

  renderStyleForBannerItem(index, currentIndex, availableSteps) {
    if (index === currentIndex) {
      return {
        ...styles.bannerItem,
        borderColor: '#3177c9',
        backgroundColor: 'rgba(49, 119, 201, 0.25)'
      };
    }

    return (availableSteps.indexOf(index) !== -1)
      ? styles.bannerItem
      : {...styles.bannerItem, color: '#ccc' };
  }

  renderNavigationButtons() {
    const {stepIndex, availableSteps} = this.props;
    const shouldShowNext = (availableSteps.indexOf(stepIndex + 1) !== -1);
    const shouldShowPrevious = (availableSteps.indexOf(stepIndex - 1) !== -1);
    return (
      <div style={styles.buttonStrip}>
        {shouldShowPrevious
          ? <Button style={{margin: 10}} onClick={this.onPreviousClicked}>{`< Back `}</Button>
          : <div />}
        {shouldShowNext
          ? <Button style={{margin: 10}} onClick={this.onNextClicked}>Next ></Button>
          : <div />}
      </div>
    );
  }
}
HorizontalStepper.propTypes = {
  steps: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  availableSteps: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
  stepIndex: React.PropTypes.number.isRequired,
  onStepChanged: React.PropTypes.func.isRequired,
  isEditable: React.PropTypes.booel.isRequired,
  renderFn: React.PropTypes.func.isRequired,
  style: React.PropTypes.object,
  contentStyle: React.PropTypes.object
};

const styles = {
  root: {
    paddingTop: 15
  },
  content: {
    borderTop: '1px solid #ccc',
    marginTop: 10
  },
  banner:{
    fontSize: 12,
    paddingLeft: 15
  },
  bannerItem: {
    padding: 8,
    paddingRight: 10,
    marginLeft: 5,
    marginRight: 10,
    cursor: 'pointer',
    border: '1px solid white',
    borderRadius: 3,
    borderColor: 'white'
  },
  bannerText: {
    paddingLeft: 5
  },
  check: {},
  buttonStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 10
  },
  divider: {
    width: '2em',
    height: 1,
    borderTop: '1px solid #eee'
  }
};
