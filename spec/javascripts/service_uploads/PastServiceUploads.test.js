import ReactDOM from 'react-dom';
import PastServiceUploads from '../../../app/assets/javascripts/service_uploads/PastServiceUploads';

describe('with null past service upload data', function () {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <PastServiceUploads
        serviceUploads={null}
        onClickDeleteServiceUpload={jest.fn()}
      />, div);
  });
});

describe('with valid past service upload data', function () {
  it('renders without crashing', () => {
    const div = document.createElement('div');

    ReactDOM.render(
      <PastServiceUploads
        serviceUploads={[
          {
            file_name: 'test_file.csv',
            created_at: 'Tue, 02 Jan 2018 15:48:53 UTC +00:00', // Rails created_at
            services: [],
          }
        ]}
        onClickDeleteServiceUpload={jest.fn()}
      />, div);
  });
});
