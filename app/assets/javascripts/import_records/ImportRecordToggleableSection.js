import React from 'react';
import PropTypes from 'prop-types';

export default class ImportRecordToggleableSection extends React.Component {

  render() {
    const {title} = this.props;
    const titleStyle = {
      marginTop: 20,
      marginBottom: 10,
      borderBottom: '1px solid #ccc'
    };

    return (
      <div>
        <div style={titleStyle}>{title} {this.renderToggle()}</div>
        {this.renderContent()}
      </div>
    );
  }

  renderContent() {
    const {shouldShow, hasNoData, content} = this.props;

    if (hasNoData === true) return null;
    if (shouldShow === false) return null;

    const preStyle = {
      fontSize: 14,
      color: '#3d3d3d',
      marginTop: 10,
      marginBottom: 20,
    };

    return (
      <pre style={preStyle}>{content}</pre>
    );
  }

  renderToggle() {
    const {shouldShow, onClickToggle} = this.props;

    const linksStyle = {
      fontSize: 12,
      marginLeft: 12,
      cursor: 'pointer',
      color: 'blue',
    };

    return (
      <span style={linksStyle} onClick={onClickToggle}>
        [{shouldShow ? 'hide' : 'show'}]
      </span>
    );
  }

}

ImportRecordToggleableSection.propTypes = {
  content: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onClickToggle: PropTypes.func.isRequired,
  shouldShow: PropTypes.bool.isRequired,
  hasNoData: PropTypes.bool.isRequired,
};

