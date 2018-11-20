module Exceptions
  class NoAssignedHomeroom < StandardError; end
  class NoAssignedSections < StandardError; end
  class EducatorNotAuthorized < StandardError; end
  class DistrictKeyNotHandledError < StandardError; end
  class InvalidConfiguration < StandardError; end
end
