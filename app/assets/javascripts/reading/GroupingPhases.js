import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Circle from '../components/Circle';
import Button from '../components/Button';


// Shows progress through a set of phases for the reading grouping process.
// This also controls the navigation buttons
export default class GroupingPhases extends React.Component {
  constructor(props) {
    super(props);

    this.onPhaseChanged = this.onPhaseChanged.bind(this);
    this.onPreviousClicked = this.onPreviousClicked.bind(this);
    this.onNextClicked = this.onNextClicked.bind(this);
  }

  phases() {
    const {phaseLabels} = this.props;
    return _.keys(phaseLabels);
  }
  onPhaseChanged(phaseKey) {
    const {onPhaseChanged, allowedPhaseKeys} = this.props;
    if (allowedPhaseKeys.indexOf(phaseKey) === -1) return;
    onPhaseChanged(phaseKey);
  }

  onPreviousClicked() {
    const {selectedPhaseKey} = this.props;
    const phaseIndex = this.phases().indexOf(selectedPhaseKey);
    this.onPhaseChanged(phaseIndex - 1);
  }

  onNextClicked() {
    const {selectedPhaseKey} = this.props;
    const phaseIndex = this.phases().indexOf(selectedPhaseKey);
    this.onPhaseChanged(phaseIndex + 1);
  }

  render() {
    const {
      selectedPhaseKey,
      allowedPhaseKeys,
      style,
      renderFn,
      contentStyle
    } = this.props;
    return (
      <div className="GroupingPhases" style={{...styles.root, ...style}}>
        <div style={styles.bannerContainer}>
          <div>
            {this.phases().map((phaseKey, phaseIndex) => {
              return (
                <span
                  key={phaseKey}
                  style={this.renderStyleForBannerItem(phaseKey)}
                  onClick={this.onPhaseChanged.bind(this, phaseKey)}>
                  <Circle
                    text={`${phaseIndex+1}`}
                    color={this.renderColorForCircle(phaseKey, allowedPhaseKeys)}
                    style={{verticalAlign: 'middle'}}/>
                  <span style={styles.bannerText}>{this.renderPhaseKeyText(phaseKey)}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div style={{...styles.content, ...contentStyle}}>
          {renderFn(selectedPhaseKey)}
        </div>
        {/* this.renderNavigationButtons() */}
      </div>
    );
  }

  renderPhaseKeyText(phaseKey) {
    const {phaseLabels} = this.props;
    return phaseLabels[phaseKey];
  }

  renderColorForCircle(phaseKey, allowedPhaseKeys) {
    return (allowedPhaseKeys.indexOf(phaseKey) !== -1)
      ? '#3177c9'
      : '#ccc';
  }

  renderStyleForBannerItem(phaseKey) {
    const {selectedPhaseKey, allowedPhaseKeys} = this.props;
    if (phaseKey === selectedPhaseKey) {
      return {
        ...styles.bannerItem,
        borderColor: '#3177c9',
        backgroundColor: 'rgba(49, 119, 201, 0.25)'
      };
    }

    return (allowedPhaseKeys.indexOf(phaseKey) !== -1)
      ? styles.bannerItem
      : {...styles.bannerItem, color: '#ccc', cursor: 'default' };
  }

  renderNavigationButtons() {
    const {selectedPhaseKey, allowedPhaseKeys} = this.props;
    const phases = this.phases();
    const phaseIndex = phases.indexOf(selectedPhaseKey);
    const shouldShowNext = (phaseIndex < phases.length && allowedPhaseKeys.indexOf(phases[phaseIndex + 1]) !== -1);
    const shouldShowPrevious = (phaseIndex > 0 && allowedPhaseKeys.indexOf(phases[phaseIndex - 1]) !== -1);
    return (
      <div style={styles.buttonStrip}>
        {shouldShowPrevious
          ? <Button style={{margin: 10}} onClick={this.onPreviousClicked}>{`< Back `}</Button>
          : <div />}
        {shouldShowNext
          ? <Button style={{margin: 10}} onClick={this.onNextClicked}>{`Next >`}</Button>
          : <div />}
      </div>
    );
  }
}
GroupingPhases.propTypes = {
  phaseLabels: PropTypes.object.isRequired,
  selectedPhaseKey: PropTypes.string.isRequired,
  allowedPhaseKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  onPhaseChanged: PropTypes.func.isRequired,
  renderFn: PropTypes.func.isRequired,
  style: PropTypes.object,
  contentStyle: PropTypes.object
};

const styles = {
  root: {
    paddingTop: 15
  },
  content: {
    borderTop: '1px solid #ccc',
    marginTop: 10,
    flex: 1
  },
  bannerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
    marginLeft: 15,
    marginRight: 15
  },
  bannerItem: {
    padding: 8,
    paddingRight: 10,
    marginLeft: 5,
    marginRight: 8,
    cursor: 'pointer',
    border: '1px solid white',
    borderRadius: 3,
    borderColor: 'white'
  },
  bannerText: {
    paddingLeft: 5
  },
  buttonStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 10
  }
};
