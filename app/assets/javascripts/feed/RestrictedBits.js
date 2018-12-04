import PropTypes from 'prop-types';
import React from 'react';


export default class RestrictedBits extends React.Component {
  onClick(e) {
    e.preventDefault();
    if (confirm("Are you sure?")) window.location.reload();
  }

  render() {
    const {style} = this.props;
    return (
      <div className="RestrictedBits" style={style}>
        <a href="#" style={styles.link} onClick={this.onClick}>Mark restricted</a>
      </div>
    );
  }
}
RestrictedBits.propTypes = {
  eventNoteId: PropTypes.number.isRequired,
  style: PropTypes.object
};

const styles = {
  link: {
    color: '#ccc'
  }
};
