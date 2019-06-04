import React from 'react';
import PropTypes from 'prop-types';
import FeedView from '../feed/FeedView';
import CleanSlateMessage, {defaultSchoolYearsBack, filteredFeedCardsForCleanSlate} from '../student_profile/CleanSlateMessage';


export default class CleanSlateFeedView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewingAllNotes: false
    };

    this.onToggleVisibility = this.onToggleVisibility.bind(this);
  }

  onToggleVisibility() {
    const {isViewingAllNotes} = this.state;
    this.setState({isViewingAllNotes: !isViewingAllNotes});
  }

  render() {
    const {nowFn} = this.context;
    const {feedCards, style} = this.props;
    const {isViewingAllNotes} = this.state;
    const schoolYearsBack = defaultSchoolYearsBack;
    const cleanSlateFeedCards = filteredFeedCardsForCleanSlate(feedCards, schoolYearsBack.number, nowFn);
    return (
      <div className="CleanSlateFeedView" style={style}>
        <FeedView feedCards={cleanSlateFeedCards} />
        <CleanSlateMessage
          canViewFullHistory={true}
          isViewingFullHistory={isViewingAllNotes}
          onToggleVisibility={this.onToggleVisibility}
          xAmountOfDataText={`${schoolYearsBack.textYears} of data`}
      />
      </div>
    );
  }
}
CleanSlateFeedView.contextTypes = {
  nowFn: PropTypes.func.isRequired
};
CleanSlateFeedView.propTypes = {
  feedCards: PropTypes.arrayOf(PropTypes.object).isRequired,
  style: PropTypes.object
};
