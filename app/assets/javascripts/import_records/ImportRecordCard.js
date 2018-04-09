import React from 'react';
import PropTypes from 'prop-types';

export default class ImportRecordCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showOptions: false,
      showFileByFile: false,
      showLog: false,
    };
  }

  onToggleState(stateKey) {
    return function () {
      this.setState({ [stateKey]: !this.state[stateKey] });
    }.bind(this);
  }

  render() {
    const {id} = this.props;
    const divStyle = {border: '1px solid #eee', padding: 15, margin: '15px 0'};
    const cardTitleStyle = {marginBottom: 15, borderBottom: '1px solid #eee', fontSize: 18};

    return (
      <div style={divStyle} key={id}>
        <div style={cardTitleStyle}>Import #{id}</div>
        {this.renderCardContent()}
      </div>
    );
  }

  renderCardContent() {
    const {completed} = this.props;

    if (completed) return this.renderCompleted();

    return this.renderNotCompleted();
  }

  renderCompleted() {
    return (
      <div>
        {this.renderTimingForCompleted()}
        {this.renderTaskOptionsSection()}
        {this.renderFileByFileSection()}
      </div>
    );
  }

  renderTimingForCompleted() {
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

  renderTimingForNotCompleted() {
    const sectionStyle = {margin: '10px 0'};

    const {time_started_display} = this.props;

    return (
      <div style={sectionStyle}>
        <div>Job is in progress or never completed.</div>
        <div>Started: {time_started_display}.</div>
      </div>
    );
  }

  renderToggle(stateKey) {
    const value = this.state[stateKey];
    const onClick = this.onToggleState(stateKey);

    const linksStyle = {fontSize: 12, marginLeft: 12};
    const onStyle = {cursor: 'pointer', margin: '0 2px'};
    const offStyle = {
      color: 'blue', cursor: 'pointer', margin: '0 2px', fontWeight: 'bold'
    };

    return (
      <span style={linksStyle}>
        [<span style={value ? onStyle : offStyle}
               onClick={value ? null : onClick}>
          show
        </span>|<span style={value ? offStyle : onStyle}
               onClick={value ? onClick : null}>
          hide
        </span>]
      </span>
    );
  }

  renderTaskOptions() {
    const {task_options_json} = this.props;
    const {showOptions} = this.state;
    if (!showOptions) return null;

    const preStyle = {fontSize: 14, color: '#3d3d3d'};

    return (
      <pre style={preStyle}>
        {JSON.stringify(JSON.parse(task_options_json), null, 2)}
      </pre>
    );
  }

  renderTaskOptionsSection() {
    const {task_options_json} = this.props;
    if (!task_options_json) return null;

    const spacingStyle = {margin: '10px 0'};

    return (
      <div style={spacingStyle}>
        <div style={spacingStyle}>Options {this.renderToggle('showOptions')}</div>
        {this.renderTaskOptions()}
      </div>
    );
  }

  renderFileByFileSection() {
    const {importer_timing_json} = this.props;
    if (!importer_timing_json) return null;

    const spacingStyle = {margin: '10px 0'};

    return (
      <div style={spacingStyle}>
        <div style={spacingStyle}>File-By-File {this.renderToggle('showFileByFile')}</div>
        {this.renderFileByFileTiming()}
      </div>
    );
  }

  renderFileByFileTiming() {
    const {importer_timing_json} = this.props;
    const {showFileByFile} = this.state;
    if (!showFileByFile) return null;

    const preStyle = {fontSize: 14, color: '#3d3d3d'};

    return (
      <pre style={preStyle}>
        {JSON.stringify(JSON.parse(importer_timing_json), null, 2)}
      </pre>
    );
  }

  renderNotCompleted() {
    return (
      <div>
        {this.renderTimingForCompleted()}
        {this.renderTaskOptionsSection()}
      </div>
    );
  }

}

ImportRecordCard.propTypes = {
  id: PropTypes.number.isRequired,
  completed: PropTypes.bool.isRequired,
  time_to_complete_in_words: PropTypes.string,
  time_started_display: PropTypes.string.isRequired,
  time_ended_display: PropTypes.string,
  task_options_json: PropTypes.string,
  importer_timing_json: PropTypes.string,
};
