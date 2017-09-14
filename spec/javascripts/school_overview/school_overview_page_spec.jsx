describe('SchoolOverviewPage', function() {
  const SchoolOverviewPage = window.shared.SchoolOverviewPage;
  const Filters = window.shared.Filters;
  
  // FILTERING FUNCTIONS //

  describe('#filterWithOr', function() {
    beforeEach(function() {
      this.mari = { name: 'Mari', classroom: '101' };    // stubby student object
      this.mark = { name: 'Mark', classroom: '101' };    // stubby student object
      this.marv = { name: 'Marv', classroom: '102' };    // stubby student object

      // Test filters
      this.MariFilter = Filters.Equal('name', 'Mari');
      this.MarkFilter = Filters.Equal('name', 'Mark');
      this.Classroom101Filter = Filters.Equal('classroom', '101');
      this.Classroom102Filter = Filters.Equal('classroom', '102');

      this.page = new SchoolOverviewPage({
        initialFilters: [],
        allStudents: [this.mark, this.mari, this.marv]
      });
    });

    describe('with filters that overlap', function() {
      it('reduces each array to the set students that match either filter with no duplicates', function() {
        const filters  = [[this.MariFilter, this.Classroom101Filter], [this.MarkFilter]];
        const result = this.page.filterWithOr(filters);
        expect(result).toEqual([
          [this.mari, this.mark], [this.mark]
        ]);
      });
    });

    describe('with one filter', function() {
      it('returns an array of students that match the fitler inside another array', function() {
        const filters = [[this.Classroom101Filter]];
        const result = this.page.filterWithOr(filters);
        expect(result).toEqual([
          [this.mark, this.mari]
        ]);
      });
    });

    describe('with an empty array', function() {
      it('returns an empty array', function() {
        const filters = [];
        const result = this.page.filterWithOr(filters);
        expect(result).toEqual([]);
      });
    });

  });

  describe('#filterWithAnd', function() {
    beforeEach(function() {
      this.page = new SchoolOverviewPage({initialFilters: []});
      this.mari = { name: 'Mari' };    // stubby student object
      this.mark = { name: 'Mark' };    // stubby student object
    });

    describe('with array of two arrays of students that intersect', function() {
      it('returns an array of the intersection', function() {
        const studentArrays = [[this.mari, this.mark], [this.mari]];
        expect(this.page.filterWithAnd(studentArrays)).toEqual([this.mari]);
      });
    });

    describe('with array of one array of students', function() {
      it('returns the array with one less level of nesting', function() {
        const studentArrays = [[this.mari]];
        expect(this.page.filterWithAnd(studentArrays)).toEqual([this.mari]);
      });
    });

    describe('with an empty array', function() {
      it('returns an empty array', function() {
        const studentArrays = [];
        expect(this.page.filterWithAnd(studentArrays)).toEqual([]);
      });
    });

  });

  // CACHING FUNCTIONS //

  describe('with one initial filter', function() {

    beforeEach(function() {
      const Filters = window.shared.Filters;
      const TestFilter = Filters.Equal('height', 'short');
      this.page = new SchoolOverviewPage({initialFilters: [TestFilter]});
    });

    describe('#activeFiltersIdentifier', function() {
      it('sets the correct identifier', function() {
        expect(this.page.activeFiltersIdentifier()).toEqual('equal:height:short');
      });
    });

    describe('#checkCache with empty cache', function() {
      it('is undefined', function () {
        expect(this.page.checkCache()).toEqual(undefined);
      });
    });

    describe('#checkCache when students have been added', function() {
      it('returns the correct students', function() {
        const students = [{ name: 'Jaime' }, { name: 'Jin' }, { name: 'Jack'}];
        this.page.addToCache(students);
        const cache = this.page.checkCache();
        expect(cache.length).toEqual(3);
        expect(cache[0].name).toEqual('Jaime');
      });
    });

  });

});
