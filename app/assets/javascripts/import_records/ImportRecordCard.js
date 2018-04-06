import React from 'react';

export default class ImportRecordCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showOptions: true,
      showFileByFile: false,
      showLog: false,
    };
  }

  onToggleState(stateKey) {
    return function () {
      this.setState({ [stateKey]: !this.state[stateKey] });
    }.bind(this)
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
    const sectionStyle = {margin: '10px 0'};
    const {
      time_to_complete_in_words,
      time_started_display,
      time_ended_display,
    } = this.props;

    return (
      <div>
        <div>
          Job completed in {time_to_complete_in_words}.
        </div>
        <div style={sectionStyle}>
          <div>Started: {time_started_display}.</div>
          <div>Ended: {time_ended_display}.</div>
        </div>
        {this.renderTaskOptionsSection()}
      </div>
    );
  }

  renderToggleOptions() {
    const {showOptions} = this.state;
    const onClick = this.onToggleState('showOptions');

    const linksStyle = {fontSize: 12, marginLeft: 12};
    const onStyle = {fontWeight: 'bold', cursor: 'pointer', margin: '0 2px'};
    const offStyle = {color: 'blue', cursor: 'pointer', margin: '0 2px'};

    return (
      <span style={linksStyle}>
        [<span style={showOptions ? onStyle : offStyle}
               onClick={showOptions ? null : onClick}>
          show
        </span>|<span style={showOptions ? offStyle : onStyle}
               onClick={showOptions ? onClick : null}>
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
        <div style={spacingStyle}>Options {this.renderToggleOptions()}</div>
        {this.renderTaskOptions()}
      </div>
    );
  }

  renderNotCompleted() {
    return (
      <div>Not Completed!</div>
    );
  }

}
