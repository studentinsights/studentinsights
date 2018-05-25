import ReactDOM from 'react-dom';
import SummaryList from './SummaryList';

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(
    <SummaryList
      title='Vulfpeck Songs'
      elements={['Animal Spirits', 'Wait for the Moment']}
    />, div);
});
