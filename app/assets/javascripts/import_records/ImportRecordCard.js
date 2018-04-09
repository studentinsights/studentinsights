import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ImportRecordTimingSection from './ImportRecordTimingSection';
import ImportRecordToggleableSection from './ImportRecordToggleableSection';

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
        <ImportRecordTimingSection {...this.props} />
        {this.renderTaskOptionsSection()}
        {this.renderFileByFileSection()}
        {this.renderLogSection()}
      </div>
    );
  }

  renderTaskOptionsSection() {
    const {task_options_json} = this.props;

    return (
      <ImportRecordToggleableSection
        shouldShow={this.state.showOptions}
        hasNoData={_.isNull(task_options_json)}
        title='Options'
        onClickToggle={this.onToggleState('showOptions')}
      >
        {JSON.stringify(JSON.parse(task_options_json), null, 2)}
      </ImportRecordToggleableSection>
    );
  }

  renderFileByFileSection() {
    const {importer_timing_json} = this.props;

    return (
      <ImportRecordToggleableSection
        shouldShow={this.state.showFileByFile}
        hasNoData={_.isNull(importer_timing_json)}
        title='File-By-File'
        onClickToggle={this.onToggleState('showFileByFile')}
      >
        {JSON.stringify(JSON.parse(importer_timing_json), null, 2)}
      </ImportRecordToggleableSection>
    );
  }

  renderLogSection() {
    const {log} = this.props;

    return (
      <ImportRecordToggleableSection
        shouldShow={this.state.showLog}
        hasNoData={_.isNull(log)}
        title='Log'
        onClickToggle={this.onToggleState('showLog')}
      >
        {log}
      </ImportRecordToggleableSection>
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
  log: PropTypes.string,
};
