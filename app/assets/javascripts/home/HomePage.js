import React from 'react';
import PropTypes from 'prop-types';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';

class HomePage extends React.Component {
  componentDidMount() {
    const serializedData = $('#serialized-data').data();
    this.setState({serializedData});
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });
  }

  render() {
    const NoteCardTwo = window.shared.NoteCardTwo;
    return (
      <div className="HomePage">
        <div>hi</div>
        <div>{this.props.notes.length}</div>
        {this.props.notes.map(note =>
          <NoteCardTwo {...note} />
        )}
      </div>
    );
  }
}

HomePage.propTypes = {
  notes: PropTypes.array.isRequired
};
export default HomePage;