import React from 'react';
import PropTypes from 'prop-types';

export default class ImportRecordTimingSection extends React.Component {

  render() {
    const {completed} = this.props;

    if (completed) return this.renderForCompleted();

    return this.renderForNotCompleted();
  }

  renderForCompleted() {
    const sectionStyle = {margin: '10px 0'};

    const {
      time_to_complete_in_words,
      time_started_display,
      time_ended_display,
    } = this.props;

    return (
      <div style={sectionStyle}>
        <div>Job completed in {time_to_complete_in_words}.</div>
        <div>Started: {time_started_display}.</div>
        <div>Ended: {time_ended_display}.</div>
      </div>
    );
  }

  renderForNotCompleted() {
    const sectionStyle = {margin: '10px 0'};

    const {time_started_display} = this.props;

    return (
      <div style={sectionStyle}>
        <div>Job is in progress or never completed.</div>
        <div>Started: {time_started_display}.</div>
      </div>
    );
  }

}

ImportRecordTimingSection.propTypes = {
  id: PropTypes.number.isRequired,
  completed: PropTypes.bool.isRequired,
  time_to_complete_in_words: PropTypes.string,
  time_started_display: PropTypes.string.isRequired,
  time_ended_display: PropTypes.string,
};
