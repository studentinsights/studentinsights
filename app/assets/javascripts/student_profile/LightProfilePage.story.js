import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withDefaultNowContext} from '../testing/NowContainer';
import {widthFrame} from '../testing/storybookFrames';
import LightProfilePage from './LightProfilePage';
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
  return withDefaultNowContext(
    <ColumnSelectorContainer {...storifyProps(props)} />
  );
}

storiesOf('profile-v3/LightProfilePage', module) // eslint-disable-line no-undef
  .add('K8, wide: Pluto Poppins', () => storyRender(testPropsForPlutoPoppins()))
  .add('K8, no photo: Pluto Poppins', () => widthFrame(storyRender(testPropsForPlutoPoppins())))
  .add('K8: Olaf White', () => widthFrame(storyRender(testPropsForOlafWhite())))
  .add('K8, New Bedford: Olaf White', () => widthFrame(storyRender({...testPropsForOlafWhite(), districtKey: 'new_bedford' })))
  .add('HS: Aladdin Mouse', () => widthFrame(storyRender(testPropsForAladdinMouse())));


// Allow navigation within story
class ColumnSelectorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedColumnKey: 'notes'
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
    return <LightProfilePage {...mergedProps} />;
  }
}
ColumnSelectorContainer.propTypes = LightProfilePage.propTypes;
