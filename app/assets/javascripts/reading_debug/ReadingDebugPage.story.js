import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {viewPropsFromJson, ReadingDebugView} from './ReadingDebugPage';
import {withTestContext} from './ReadingDebugPage.test';
import readingDebugJson from './reading_debug_json.fixture';


storiesOf('reading_debug/ReadingDebugPage', module) // eslint-disable-line no-undef
  .add('readonly view only', () => {
    const props = viewPropsFromJson({
      json: readingDebugJson,
      onSchoolIdNowChanged: action('onSchoolIdNowChanged')
    });
    return withTestContext(<ReadingDebugView {...props} />);
  });