import React from 'react';
import Circle from '../components/Circle';


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
    const {onStepChanged} = this.props;
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
    const {steps, renderFn, style, contentStyle} = this.props;
    const currentStepIndex = this.props.stepIndex;
    return (
      <div className="HorizontalStepper" style={{...styles.root, ...style}}>
        <div style={styles.banner}>
          {steps.map((step, stepIndex) => {
            return (
              <span
                key={stepIndex}
                style={this.renderStyleForBannerItem(stepIndex, currentStepIndex)}
                onClick={this.onStepChanged.bind(this, stepIndex)}>
                <Circle
                  text={`${stepIndex+1}`}
                  color={this.renderColorForCircle(stepIndex, currentStepIndex)}
                  style={{verticalAlign: 'middle'}}/>
                <span style={styles.bannerText}>{step}</span>
              </span>
            );
          })}
        </div>
        <div style={{...styles.content, ...contentStyle}}>
          {renderFn(currentStepIndex, steps[currentStepIndex])}
        </div>
        {this.renderNavigationButtons()}
      </div>
    );
  }

  renderColorForCircle(index, currentIndex) {
    return (index <= currentIndex)
      ? '#3177c9'
      : '#ccc';
  }

  renderStyleForBannerItem(index, currentIndex) {
    if (index === currentIndex) {
      return {
        ...styles.bannerItem,
        borderColor: '#3177c9',
        backgroundColor: 'rgba(49, 119, 201, 0.25)'
      };
    }

    return (index <= currentIndex)
      ? styles.bannerItem
      : {...styles.bannerItem, color: '#ccc' };
  }

  renderNavigationButtons() {
    const {shouldShowNext, shouldShowPrevious} = this.props;
    return (
      <div>
        {shouldShowPrevious && <button className="btn" style={{float: 'left', marginLeft: 10, marginTop: 10}} onClick={this.onPreviousClicked}>{`< Back `}</button>}
        {shouldShowNext && <button className="btn" style={{float: 'right', marginRight: 10, marginTop: 10}} onClick={this.onNextClicked}>Next ></button>}
      </div>
    );
  }
}
HorizontalStepper.propTypes = {
  steps: React.PropTypes.array.isRequired,
  renderFn: React.PropTypes.func.isRequired,
  stepIndex: React.PropTypes.number.isRequired,
  onStepChanged: React.PropTypes.func.isRequired,
  shouldShowNext: React.PropTypes.bool,
  shouldShowPrevious: React.PropTypes.bool,
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
  divider: {
    width: '2em',
    height: 1,
    borderTop: '1px solid #eee'
  }
};
