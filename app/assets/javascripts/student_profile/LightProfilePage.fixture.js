import {initialState} from './PageContainer';
import serializedDataForOlafWhite from './fixtures/serializedDataForOlafWhite.fixture';
import serializedDataForPlutoPoppins from './fixtures/serializedDataForPlutoPoppins.fixture';
import serializedDataForAladdinMouse from './fixtures/serializedDataForAladdinMouse.fixture';
import {createSpyActions} from './mockPageContainerProps';

export function testPropsForOlafWhite() {
  return testPropsFromSerializedData(serializedDataForOlafWhite);
}

export function testPropsForPlutoPoppins() {
  return testPropsFromSerializedData(serializedDataForPlutoPoppins);
}

export function testPropsForAladdinMouse() {
  return testPropsFromSerializedData(serializedDataForAladdinMouse);
}

export function testPropsFromSerializedData(serializedData, queryParams = {}) {
  return {
    ...initialState({
      queryParams,
      defaultFeed: serializedData.feed,
    }),
    profileJson: serializedData,
    actions: createSpyActions()
  };
}
