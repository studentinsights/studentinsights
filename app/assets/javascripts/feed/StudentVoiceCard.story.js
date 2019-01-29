import React from 'react';
import {storiesOf} from '@storybook/react';
import {testEl, propsWithNStudents} from './StudentVoiceCard.test';

storiesOf('feed/StudentVoiceCard', module) // eslint-disable-line no-undef
  .add('combinations', () => (
    <div>
      {testEl(propsWithNStudents(1))}
      {testEl(propsWithNStudents(2))}
      {testEl(propsWithNStudents(3))}
      {testEl(propsWithNStudents(4))}
      {testEl({...propsWithNStudents(4), shuffleSeed: 100})}
      {testEl({...propsWithNStudents(4), shuffleSeed: 200})}
    </div>
  ));
