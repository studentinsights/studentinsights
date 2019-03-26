import React from 'react';
import _ from 'lodash';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import PerDistrictContainer from '../components/PerDistrictContainer';
import {withDefaultNowContext} from '../testing/NowContainer';
import {widthFrame} from '../testing/storybookFrames';
import LightProfilePage from './LightProfilePage';
import {createSpyActions} from './PageContainer.mocks';
import {
  testPropsForPlutoPoppins,
  testPropsForOlafWhite,
  testPropsForAladdinMouse
} from './LightProfilePage.fixture';


function storifyProps(props) {
  const actions = _.reduce(createSpyActions(), (map, value, key) => {
    return {...map, [key]: action(key)};
  }, {});
  return {
    ...props,
    actions
  };
}

function storyRender(props, context = {}) {
  const districtKey = context.districtKey || 'somerville';
  return withDefaultNowContext(
    <PerDistrictContainer districtKey={districtKey}>
      <ColumnSelectorContainer {...storifyProps(props)} />
    </PerDistrictContainer>
  );
}

storiesOf('profile/LightProfilePage', module) // eslint-disable-line no-undef
  .add('K8, wide: Pluto Poppins', () => storyRender(testPropsForPlutoPoppins()))
  .add('K8, no photo: Pluto Poppins', () => widthFrame(storyRender(testPropsForPlutoPoppins())))
  .add('K8: Olaf White', () => widthFrame(storyRender(testPropsForOlafWhite())))
  .add('K8, Bedford: Olaf White', () => widthFrame(storyRender(testPropsForOlafWhite(), { districtKey: 'bedford' })))
  .add('K8, New Bedford: Olaf White', () => widthFrame(storyRender(testPropsForOlafWhite(), { districtKey: 'new_bedford' })))
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
