import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import StudentProfilePage from './StudentProfilePage';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
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
  return <ColumnSelectorContainer {...storifyProps(props)} />;
}

storiesOf('profile/StudentProfilePage', module) // eslint-disable-line no-undef
  .add('Olaf White', () => storyRender(testPropsForOlafWhite()))
  .add('Pluto Poppins', () => storyRender(testPropsForPlutoPoppins()))
  .add('Aladdin Mouse', () => storyRender(testPropsForAladdinMouse()));


// Allow navigation within story
class ColumnSelectorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumnKey: 'interventions'
    };
    this.onColumnClicked = this.onColumnClicked.bind(this);
  }

  onColumnClicked(columnKey) {
    this.setState({ selectedColumnKey: columnKey });
  }

  render() {
    const {actions} = this.props;
    const {selectedColumnKey} = this.state;
    const mergedProps = {
      ...this.props,
      selectedColumnKey,
      actions: {
        ...actions,
        onColumnClicked: this.onColumnClicked
      }
    };
    return <StudentProfilePage {...mergedProps} />;
  }
}
ColumnSelectorContainer.propTypes = StudentProfilePage.propTypes;
