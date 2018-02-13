import ReactDOM from 'react-dom';
import ServiceUploadDetail from './ServiceUploadDetail.js';

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(
    <ServiceUploadDetail
      data={{
        id: 1,
        file_name: 'Good_Service_Upload.csv',
        created_at: '2018-02-13T22:17:30.338Z',
        services: [
          {
            id: 1,
            service_type: { name: 'Tutoring' },
            student: {
              id: 1, first_name: 'Joseph', last_name: 'Gan'
            }
          }
        ]
      }}
      onClickDeleteServiceUpload={jest.fn()}
    />, div);
});
