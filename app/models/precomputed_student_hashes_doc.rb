class PrecomputedStudentHashesDoc < ActiveRecord::Base
  self.primary_key = 'key'
  # A key-value store for holding a precomputed JSON doc, like Redis but durable since it's precomputed
  # and not a read-through cache.
end
