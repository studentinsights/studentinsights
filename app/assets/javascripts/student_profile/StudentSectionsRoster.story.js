import React from 'react';
import {storiesOf} from '@storybook/react';
import StudentSectionsRoster from './StudentSectionsRoster';
import {testProps} from './StudentSectionsRoster.test';


storiesOf('profile/StudentSectionsRoster', module) // eslint-disable-line no-undef
  .add('all', () => {
    const props = testProps();
    return <StudentSectionsRoster {...props} />;
  });