import React from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from 'react-addons-test-utils';
import fetchMock from 'fetch-mock/es5/client';
import ServiceUploadsPage from './ServiceUploadsPage';

function testProps(props = {}) {
  return {
    serializedData: {
      serviceTypeNames: ['Extra Tutoring', 'After-School Art Class'],
    },
    ...props
  };
}

function testRender(props) {
  const el = document.createElement('div');
  const instance = ReactDOM.render(<ServiceUploadsPage {...props} />, el); // eslint-disable-line react/no-render-return-value
  return {el, instance};
}


describe('integration tests', () => {
  beforeEach(() => {
    fetchMock.restore();
    fetchMock.get('/service_uploads/past', []);
  });

  it('renders the page', () => {
    const {el} = testRender(testProps());
    expect($(el).text()).toContain('Upload new services');
    expect($(el).text()).toContain('Confirm Upload');
  });

  it('tolerates cancelling file upload', () => {
    const {el, instance} = testRender(testProps());
    const fileInputEl = $(el).find('input[type=file]').get(0);
    ReactTestUtils.Simulate.change(fileInputEl);
    expect(instance.state.formData.file_name).toEqual(undefined);
  });
});
