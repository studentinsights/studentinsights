import React from 'react';
import { storiesOf } from '@storybook/react';


storiesOf('student/RiskBubble', module) // eslint-disable-line no-undef
  .add('all', () => {
    const RiskBubble = window.shared.RiskBubble;
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
       <RiskBubble riskLevel={0} />
       <RiskBubble riskLevel={1} />
       <RiskBubble riskLevel={2} />
       <RiskBubble riskLevel={3} />
       <RiskBubble riskLevel={4} />
       <RiskBubble riskLevel={null} />
      </div>
    );
  });
