import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ImportRecordTimingSection from './ImportRecordTimingSection';
import ImportRecordToggleableSection from './ImportRecordToggleableSection';
import Card from '../components/Card';

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
    this.setState({ [stateKey]: !this.state[stateKey] });
  }

  render() {
    const {id} = this.props;

    return (
      <Card style={styles.cardStyle}>
        <h4 style={styles.cardTitleStyle}>Import #{id}</h4>
        <ImportRecordTimingSection {...this.props} />
        {this.renderTaskOptionsSection()}
        {this.renderFileByFileSection()}
        {this.renderLogSection()}
      </Card>
    );
  }

  renderTaskOptionsSection() {
    const {task_options_json} = this.props;

    return (
      <ImportRecordToggleableSection
        title='Options'
        shouldShow={this.state.showOptions}
        hasNoData={_.isNull(task_options_json)}
        onClickToggle={this.onToggleState.bind(this, 'showOptions')}
        content={JSON.stringify(JSON.parse(task_options_json), null, 2)} />
    );
  }

  renderFileByFileSection() {
    const {importer_timing_json} = this.props;

    return (
      <ImportRecordToggleableSection
        title='File-By-File'
        shouldShow={this.state.showFileByFile}
        hasNoData={_.isNull(importer_timing_json)}
        onClickToggle={this.onToggleState.bind(this, 'showFileByFile')}
        content={JSON.stringify(JSON.parse(importer_timing_json), null, 2)} />
    );
  }

  renderLogSection() {
    const {log} = this.props;

    return (
      <ImportRecordToggleableSection
        shouldShow={this.state.showLog}
        hasNoData={_.isNull(log)}
        title='Log'
        onClickToggle={this.onToggleState.bind(this, 'showLog')}
        content={log} />
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

const styles = {
  cardTitleStyle: {
    marginBottom: 15,
    borderBottom: '1px solid #eee',
    fontSize: 18
  },
  cardStyle: {
    margin: '20px 0'
  }
};
