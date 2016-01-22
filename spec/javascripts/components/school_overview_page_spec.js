describe('SchoolOverviewPage', function() {

  // CACHING FUNCTIONS //

  describe('with one initial filter', function() {

    beforeEach(function() {
      var TestFilter = Filters.Equal('height', 'short');
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
        var students = [{ name: 'Jaime' }, { name: 'Jin' }, { name: 'Jack'}];
        this.page.addToCache(students);
        var cache = this.page.checkCache();
        expect(cache.length).toEqual(3);
        expect(cache[0].name).toEqual('Jaime');
      });
    });

  });

});
