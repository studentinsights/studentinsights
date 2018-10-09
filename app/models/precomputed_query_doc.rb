class PrecomputedQueryDoc < ApplicationRecord
  # A key-value store for holding a precomputed JSON doc, like Redis but durable since it's precomputed
  # and not a read-through cache.
  # The primary key means nothing, and reads and writes should be done on the `key` column, which
  # has an index and uniqueness constraint.

  # The original formats to this key concatenated all student_ids but is deprecated and
  # no longer used (although it's still here since data still exists thats keyed like that).
  # That can be accessed with `force_deprecated_key`.

  def self.precomputed_student_hashes_key(time_now, authorized_student_ids, options = {})
    timestamp = time_now.beginning_of_day.to_i
    authorized_students_key = authorized_student_ids.sort.join(',')
    if options[:force_deprecated_key]
      ['precomputed_student_hashes', timestamp, authorized_students_key].join('_')
    else
      ['short', timestamp, authorized_student_ids.size, Digest::SHA256.hexdigest(authorized_students_key)].join(':')
    end
  end

end
