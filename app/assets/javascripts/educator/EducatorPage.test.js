import React from 'react';
import ReactDOM from 'react-dom';
import {mount} from 'enzyme';
import {withDefaultNowContext} from '../../../../spec/javascripts/support/NowContainer';
import fetchMock from 'fetch-mock/es5/client';
import EducatorPage from './EducatorPage';
import educatorsViewJson from '../../../../spec/javascripts/fixtures/educatorsViewJson';
import Section from '../components/Section';

function testProps() {
  return {
    educatorId: 101
  };
}

jest.mock('../home/HomePage', () => 'mocked-home-page');
beforeEach(() => {
  fetchMock.restore();
  fetchMock.get('/api/educators/101', educatorsViewJson);
});

it('renders without crashing', () => {
  const props = testProps();
  const el = document.createElement('div');
  ReactDOM.render(withDefaultNowContext(<EducatorPage {...props} />), el);
});

describe('integration tests', () => {
  it('renders everything after fetch', done => {
    const props = testProps();
    const wrapper = mount(withDefaultNowContext(<EducatorPage {...props} />));
    expect(wrapper.html()).toContain('This is an experimental prototype page!');

    setTimeout(() => {
      const text = wrapper.text();
      expect(text).toContain('Educator info');
      expect(text).toContain('Name: Hugo Teacher');
      expect(text).toContain('Sections:');
      expect(text).toContain('Home page');

      // This works around a bug in Enzyme:
      // https://github.com/airbnb/enzyme/issues/1233#issuecomment-343449560
      wrapper.update();
      expect(wrapper.find(Section).length).toEqual(2);
      expect(wrapper.find('mocked-home-page').props()).toEqual({
        educatorId: 101,
        educatorLabels: []
      });      
      done();
    }, 0);
  });
});