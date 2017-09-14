describe('Routes', () => {
  const Routes = window.shared.Routes;

  describe('#studentProfile', () => {
    it('returns URLs with encoded query string', () => {
      expect(Routes.studentProfile(3)).toEqual('/students/3');
      expect(Routes.studentProfile(3, { foo: 'value is bar' })).toEqual('/students/3?foo=value+is+bar');
    });
  });
});
