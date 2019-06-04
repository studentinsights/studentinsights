import React from 'react';
import PropTypes from 'prop-types';
import CleanSlateFeedView from '../feed/CleanSlateFeedView';


export default function NotesDialog(props) {
  const {feedCards, style} = props;
  return (
    <CleanSlateFeedView
      feedCards={feedCards}
      style={style}
    />
  );
}
NotesDialog.propTypes = {
  feedCards: PropTypes.arrayOf(PropTypes.object).isRequired,
  style: PropTypes.object
};
