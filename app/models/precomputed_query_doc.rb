class PrecomputedQueryDoc < ApplicationRecord
  # A key-value store for holding a precomputed JSON doc (eg, for a query that's hard to optimize
  # or wants to use arbitrary Ruby code).  It's intended to be precomputed and durable, not a
  # read-through cache (since the computations are expensive).
  #
  # The primary key means nothing, and reads and writes should be done based on the `key` column.
  #
  # There are a few variations on this over time.
  #
  # 1) precomputed_student_hashes / :force_deprecated_key
  # The original formats to this key concatenated all student_ids but is deprecated and
  # no longer used (although it's still here since data still exists thats keyed like that).
  # That can be accessed with `force_deprecated_key`.
  #
  # 2) short / :force_deprecated_day_based_key
  # This hashes all the student_ids, since plain concatenation led to really long strings that
  # were outside the length limit for the key column.
  # 
  # 3) continuous_for_student_ids
  # originally we ran the import every day, and scheduled the precompute task to come after,
  # so it made sense for the key to be "give me the value for this day"  but running more 
  # frequent imports means this doesn't fit as well, and then complicates the fallback from
  # simply "last computed value".  this no longer uses the "date" as a key, and we add this
  # precompute task to the end of the import job.
  def self.precomputed_student_hashes_key(authorized_student_ids, options = {})
    if options[:force_deprecated_key]
      timestamp = options.fetch(:time_now, Time.now).beginning_of_day.to_i
      students_key = authorized_student_ids.sort.join(',')
      ['precomputed_student_hashes', timestamp, students_key].join('_')
    elsif options[:force_deprecated_day_based_key]
      timestamp = options.fetch(:time_now, Time.now).beginning_of_day.to_i
      students_digest = self.authorized_students_digest(authorized_student_ids)
      ['short', timestamp, authorized_student_ids.size, students_digest].join(':')
    else
      students_digest = self.authorized_students_digest(authorized_student_ids)
      ['continuous_for_student_ids', authorized_student_ids.size, students_digest].join(':')
    end
  end

  def self.authorized_students_digest(authorized_student_ids)
    authorized_students_key = authorized_student_ids.sort.join(',')
    Digest::SHA256.hexdigest(authorized_students_key)
  end
end
