import React from 'react';
import {storiesOf} from '@storybook/react';
import NoteBadge from './NoteBadge';

storiesOf('components/NoteBadge', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={300} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={301} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={302} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={304} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={305} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={306} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={307} /></div>
        <div style={{padding: 10}}><NoteBadge eventNoteTypeId={400} /></div>
      </div>
    );
  });