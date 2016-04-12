class PrecomputedQueryDoc < ActiveRecord::Base
  # A key-value store for holding a precomputed JSON doc, like Redis but durable since it's precomputed
  # and not a read-through cache.
  # The primary key means nothing, and reads and writes should be done on the `key` column, which
  # has an index and uniqueness constraint.
end
