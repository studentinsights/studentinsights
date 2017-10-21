import React from 'react';
import { storiesOf } from '@storybook/react';
import FlexibleRoster from './flexible_roster.jsx';
import students from '../../../../spec/javascripts/fixtures/students.jsx';



storiesOf('components/FlexibleRoster', module) // eslint-disable-line no-undef
  .add('with students', () =>
    <FlexibleRoster
      rows={students}
      columns={[
        { label: 'Name', key: 'first_name' }
      ]} />
  );
