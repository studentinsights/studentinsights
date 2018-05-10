import React from 'react';
import {storiesOf} from '@storybook/react';
import Stack from './Stack';


storiesOf('components/Stack', module) // eslint-disable-line no-undef
  .add('all', () => {
    return (
      <div>
        <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 300, height: 30, border: '1px solid #333'}}>
          <Stack
            stacks={[
              {count: 18, color: 'red'},
              {count: 8, color: 'orange'}
            ]}
            scaleFn={count => count / (18+8)}
            labelFn={count => count}
          />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', margin: 20, width: 300, height: 20, border: '1px solid #eee'}}>
          <Stack
            barStyle={{
              height: 6
            }}
            labelStyle={{
              fontSize: 10,
              display: 'flex',
              alignItems: 'flex-end'
            }}
            stacks={[
              {count: 18, color: 'red'},
              {count: 8, color: 'orange'}
            ]}
            scaleFn={count => count / (18+8)}
            labelFn={(count, stack, index) => index === 0 ? count : null}
          />
        </div>
      </div>
    );
  });