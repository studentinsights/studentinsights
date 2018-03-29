import * as Routes from '../../../app/assets/javascripts/helpers/Routes';

describe('Routes', function() {
  describe('#studentProfile', function() {
    it('returns URLs with encoded query string', function() {
      expect(Routes.studentProfile(3)).toEqual('/students/3');
      expect(Routes.studentProfile(3, {foo: 'value is bar'})).toEqual('/students/3?foo=value%20is%20bar');
    });
  });
});