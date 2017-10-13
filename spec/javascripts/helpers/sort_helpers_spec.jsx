import SortHelpers from '../../../app/assets/javascripts/helpers/sort_helpers.jsx';

describe('SortHelpers', function() {
  describe('#sortByCustomEnum', function() {
    const customEnum = ['One', 'Two', 'Three', 'Four', 'Five'];
    const preSortData = [
      {testElement: 'Five'},
      {testElement: 'Four'},
      {testElement: 'Five'},
      {testElement: 'One'},
      {testElement: null}
    ];

    it('correctly sorts', function() {
      let sortData = preSortData.slice();

      let targetData = [
        {testElement: null},
        {testElement: 'One'},
        {testElement: 'Four'},
        {testElement: 'Five'},
        {testElement: 'Five'}
      ];

      sortData.sort((a, b) => SortHelpers.sortByCustomEnum(a, b, 'testElement', customEnum));

      let match = true;

      for(let i=0; i<preSortData.length; i++){
        if(sortData[i]['testElement'] !== targetData[i]['testElement']) {
          match = false;
        }
      }

      expect(match).toBe(true);

    });
  });

  describe('#sortByNumber', function() {
    const preSortData = [
      {testElement: 5},
      {testElement: 4},
      {testElement: null},
      {testElement: 5},
      {testElement: 1},
      {testElement: null},
      {testElement: 0},
      {testElement: 5},
      {testElement: 1},
      {testElement: null}
    ];

    it('correctly sorts', function() {
      let sortData = preSortData.slice();

      let targetData = [
        {testElement: 5},
        {testElement: 5},
        {testElement: 5},
        {testElement: 4},
        {testElement: 1},
        {testElement: 1},
        {testElement: 0},
        {testElement: null},
        {testElement: null},
        {testElement: null},
      ];

      sortData.sort((a, b) => SortHelpers.sortByNumber(a, b, 'testElement'));

      let match = true;

      for(let i=0; i<preSortData.length; i++){
        if(sortData[i]['testElement'] !== targetData[i]['testElement']) {
          match = false;
        }
      }

      expect(match).toBe(true);

    });
  });

});
