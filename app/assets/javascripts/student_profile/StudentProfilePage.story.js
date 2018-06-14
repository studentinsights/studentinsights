import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import StudentProfilePage from './StudentProfilePage';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite
} from './StudentProfilePage.test';

function storifyProps(props) {
  return {
    ...props,
    actions: {
      onColumnClicked: action('onColumnClicked'),
      onClickSaveNotes: action('onClickSaveNotes'),
      onClickSaveTransitionNote: action('onClickSaveTransitionNote'),
      onDeleteEventNoteAttachment: action('onDeleteEventNoteAttachment'),
      onClickSaveService: action('onClickSaveService'),
      onClickDiscontinueService: action('onClickDiscontinueService'),
      onChangeNoteInProgressText: action('onChangeNoteInProgressText'),
      onClickNoteType: action('onClickNoteType'),
      onChangeAttachmentUrl: action('onChangeAttachmentUrl')
    }
  };
}

function storyRender(props) {
  return <StudentProfilePage {...storifyProps(props)} />;
}

storiesOf('profile/StudentProfilePage', module) // eslint-disable-line no-undef
  .add('Olaf White', () => storyRender(testPropsForOlafWhite()))
  .add('Pluto Poppins', () => storyRender(testPropsForPlutoPoppins()));
