describe('SchoolOverviewPage', function() {
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;
  
  // FILTERING FUNCTIONS //

  describe('#filterWithOr', function() {
    const mari = { name: 'Mari', classroom: '101' };    // stubby student object
    const mark = { name: 'Mark', classroom: '101' };    // stubby student object
    const marv = { name: 'Marv', classroom: '102' };    // stubby student object
    const page = new SchoolOverviewPage({
      initialFilters: [],
      allStudents: [mark, mari, marv]
    });

    // Test filters
    const MariFilter = Filters.Equal('name', 'Mari');
    const MarkFilter = Filters.Equal('name', 'Mark');
    const Classroom101Filter = Filters.Equal('classroom', '101');
    
    describe('with filters that overlap', function() {
      it('reduces each array to the set students that match either filter with no duplicates', function() {
        const filters  = [[MariFilter, Classroom101Filter], [MarkFilter]];
        const result = page.filterWithOr(filters);
        expect(result).toEqual([
          [mari, mark], [mark]
        ]);
      });
    });

    describe('with one filter', function() {
      it('returns an array of students that match the fitler inside another array', function() {
        const filters = [[Classroom101Filter]];
        const result = page.filterWithOr(filters);
        expect(result).toEqual([
          [mark, mari]
        ]);
      });
    });

    describe('with an empty array', function() {
      it('returns an empty array', function() {
        const filters = [];
        const result = page.filterWithOr(filters);
        expect(result).toEqual([]);
      });
    });

  });

  describe('#filterWithAnd', function() {
    const page = new SchoolOverviewPage({initialFilters: []});
    const mari = { name: 'Mari' };    // stubby student object
    const mark = { name: 'Mark' };    // stubby student object

    describe('with array of two arrays of students that intersect', function() {
      it('returns an array of the intersection', function() {
        const studentArrays = [[mari, mark], [mari]];
        expect(page.filterWithAnd(studentArrays)).toEqual([mari]);
      });
    });

    describe('with array of one array of students', function() {
      it('returns the array with one less level of nesting', function() {
        const studentArrays = [[mari]];
        expect(page.filterWithAnd(studentArrays)).toEqual([mari]);
      });
    });

    describe('with an empty array', function() {
      it('returns an empty array', function() {
        const studentArrays = [];
        expect(page.filterWithAnd(studentArrays)).toEqual([]);
      });
    });

  });

  // CACHING FUNCTIONS //

  describe('with one initial filter', function() {
    const TestFilter = Filters.Equal('height', 'short');
    const page = new SchoolOverviewPage({initialFilters: [TestFilter]});

    describe('#activeFiltersIdentifier', function() {
      it('sets the correct identifier', function() {
        expect(page.activeFiltersIdentifier()).toEqual('equal:height:short');
      });
    });

    describe('#checkCache with empty cache', function() {
      it('is undefined', function () {
        expect(page.checkCache()).toEqual(undefined);
      });
    });

    describe('#checkCache when students have been added', function() {
      it('returns the correct students', function() {
        const students = [{ name: 'Jaime' }, { name: 'Jin' }, { name: 'Jack'}];
        page.addToCache(students);
        const cache = page.checkCache();
        expect(cache.length).toEqual(3);
        expect(cache[0].name).toEqual('Jaime');
      });
    });

  });

});
