import React from 'react';
import MixpanelUtils from '../helpers/mixpanel_utils.jsx';


class HomePage extends React.Component {
  componentDidMount() {
    const serializedData = $('#serialized-data').data();
    this.setState({serializedData});
    MixpanelUtils.registerUser(serializedData.currentEducator);
    MixpanelUtils.track('PAGE_VISIT', { page_key: 'STUDENT_PROFILE' });
  }

  render() {
    return (
      <div className="HomePage">
        <div>hi</div>
      </div>
    );
  }
}

export default HomePage;