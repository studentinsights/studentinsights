import ReactDOM from 'react-dom';
import ServiceTypeDropdown from '../../../app/assets/javascripts/service_uploads/ServiceTypeDropdown';

describe('data', function () {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <ServiceTypeDropdown
        onUserTypingServiceType={jest.fn()}
        onUserSelectServiceType={jest.fn()}
        value={'Valuable Service'}
      />, div);
  });
});
