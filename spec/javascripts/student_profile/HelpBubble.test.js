import ReactDOM from 'react-dom';
import HelpBubble from '../../../app/assets/javascripts/student_profile/HelpBubble';

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
      teaserText='Find out more.'
    />, div);
});
