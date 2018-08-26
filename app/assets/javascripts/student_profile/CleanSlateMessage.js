import React from 'react';
import PropTypes from 'prop-types';


// UI component, showing a message about "clean slate", and allows folks with
// access to toggle this.
export default class CleanSlateMessage extends React.Component {
  constructor(props) {
    super(props);
    this.onToggleVisibility = this.onToggleVisibility.bind(this);
  }

  onToggleVisibility(e) {
    const {onToggleVisibility} = this.props;
    e.preventDefault();
    onToggleVisibility();
  }

  render() {
    const {canViewFullHistory, xAmountOfDataText} = this.props;

    return (
      <div style={styles.cleanSlateMessage}>
        <div style={{fontWeight: 'bold'}}>A note about student privacy</div>
          <span>To respect student privacy, this page only shows {xAmountOfDataText} by default.  </span>
          {canViewFullHistory
            ? this.renderCleanStateMessageForAdmin()
            : <span>If you need to know more about the student's case history, talk with an administrator who will have access to this data.</span>
          }
      </div>
    );
  }

  renderCleanStateMessageForAdmin() {
    const {isViewingFullHistory} = this.props;

    return (
      <span>
        <span>Before accessing older data, consider the balance between learning
        from these records and giving students a chance to start each year with a
        clean slate.</span>
        <a className="CleanSlateMessage-show-history-link" href="#" style={styles.showLink} onClick={this.onToggleVisibility}>
          {isViewingFullHistory ? 'hide full case history' : 'show full case history'}
        </a>
      </span>
    );
  }
}
CleanSlateMessage.propTypes = {
  canViewFullHistory: PropTypes.bool.isRequired,
  isViewingFullHistory: PropTypes.bool.isRequired,
  onToggleVisibility: PropTypes.func.isRequired,
  xAmountOfDataText: PropTypes.string.isRequired
};

const styles = {
  cleanSlateMessage: {
    padding: 10,
    paddingTop: 15,
    paddingBottom: 0
  },
  showLink: {
    display: 'inline-block',
    paddingLeft: 5,
    cursor: 'pointer',
    color: '#999'
  }
};
