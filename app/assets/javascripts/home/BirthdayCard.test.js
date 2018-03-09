import React from 'react';
import ReactDOM from 'react-dom';
import BirthdayCard from './BirthdayCard';
import {
  withNowContext,
  withDefaultNowContext
} from '../../../../spec/javascripts/support/NowContainer';

it('renders without crashing', () => {
  const studentBirthdayCard = {
    id: 4,
    first_name: 'Luke',
    last_name: 'Kenobi',
    date_of_birth: '2004-03-05T00:00:00.000Z'
  };
  const el = document.createElement('div');
  ReactDOM.render(
    withDefaultNowContext(
      <BirthdayCard studentBirthdayCard={studentBirthdayCard} />
    )
  , el);
  expect($(el).text()).toContain("🎉Luke Kenobi's birthday was on Monday 3/5!");
  expect($(el).find('a').attr('href')).toEqual('/students/4');
});

it('renders copy for birthday today', () => {
  const studentBirthdayCard = {
    id: 4,
    first_name: 'Luke',
    last_name: 'Kenobi',
    date_of_birth: '2004-03-05T00:00:00.000Z'
  };
  const el = document.createElement('div');
  ReactDOM.render(
    withNowContext('2004-03-05T09:23:14.000Z', 
      <BirthdayCard studentBirthdayCard={studentBirthdayCard} />
    )
  , el);
  expect($(el).text()).toContain("🎉Luke Kenobi's birthday is on Monday 3/5!");
  expect($(el).find('a').attr('href')).toEqual('/students/4');
});