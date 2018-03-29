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
            id: 3,
            file_name: 'test_file.csv',
            created_at: '2018-01-03T14:38:38.505Z', // Rails created_at
            services: [],
          }
        ]}
        onClickDeleteServiceUpload={jest.fn()}
      />, div);
  });
});
