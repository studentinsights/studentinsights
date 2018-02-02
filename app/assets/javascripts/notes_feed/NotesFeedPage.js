import _ from 'lodash';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';
import React from 'react';

class NotesFeedPage extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="notes-feed" style={{ fontSize: styles.fontSize }}>
        <div className="notes-list" style={{ backgroundColor: 'red'}}>
          <NotesList
            eventNotes={this.props.eventNotes} />
        </div>
      </div>
    );
  }
}

NotesFeedPage.propTypes = {
  eventNotes: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

export default NotesFeedPage;
