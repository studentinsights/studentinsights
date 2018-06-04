import React from 'react';
import ReactDOM from 'react-dom';
import HelpBubble from './HelpBubble';

it('renders without crashing', () => {
  const div = document.createElement('div');

  const getSparklyBubbleContent = function () {
    return (
      <div>Sparkly bubble.</div>
    );
  };

  ReactDOM.render(
    <HelpBubble
      title='What is a Note?'
      content={getSparklyBubbleContent()}
      teaser='Find out more.'
    />, div);
});
