import ReactDom from 'react-dom';
import DashboardHelpers from '../../../app/assets/javascripts/school_administrator_dashboard/dashboard_components/dashboard_helpers.jsx';

import * as Data from './DashboardTestData.js';

describe('DashboardHelpers', () => {
  describe('GroupByHomeroom', () => {
    it('returns a hash with homerooms as keys', () => {
      const students = Data.Students;
      const groupedStudents = DashboardHelpers.groupByHomeroom(students);
      expect(groupedStudents).toEqual({
        'Test 1': [students[0], students[1], students[2]],
        'Test 2': [students[3], students[4]],
        'No Homeroom': [students[5]]
      });
    });
  });
});

