import React from 'react';
import ReactDOM from 'react-dom';
import BirthdayCard from './BirthdayCard';

it('renders without crashing', () => {
  const studentBirthdayCard = {
    id: 4,
    first_name: 'Luke',
    last_name: 'Kenobi',
    date_of_birth: '2004-03-05T00:00:00.000Z'
  };
  const el = document.createElement('div');
  ReactDOM.render(<BirthdayCard studentBirthdayCard={studentBirthdayCard} />, el);
  expect($(el).text()).toContain("🎉Luke Kenobi's birthday was on Monday 3/5!");
  expect($(el).find('a').attr('href')).toEqual('/students/4');
});