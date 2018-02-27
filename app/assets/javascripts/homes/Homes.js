import React from 'react';
import PropTypes from 'prop-types';

class Homes extends React.Component {
  render() {
    const NoteCardTwo = window.shared.NoteCardTwo;
    return (
      <div>
        <div>hi</div>
        <div>{this.props.notes.length}</div>
        {this.props.notes.map(note =>
          <NoteCardTwo {...note} />
        )}
      </div>
    );
  }
}

Homes.propTypes = {
  notes: PropTypes.array.isRequired
};
export default Homes;