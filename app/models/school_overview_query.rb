class SchoolOverviewQuery
  include SerializeDataHelper
  include StudentsQueryHelper

  def initialize(school:, current_educator:)
    @school = school
    @current_educator = current_educator
  end

  def student_hashes
    log_timing('schools#show student_hashes') do
      load_precomputed_student_hashes(Time.now, authorized_students_for_overview.map(&:id))
    end
  end

  def merged_student_hashes
    log_timing('schools#show merge_mutable_fields_for_slicing') do
      merge_mutable_fields_for_slicing(student_hashes)
    end
  end

  def authorized_students_for_overview
    if @current_educator.districtwide_access?
      @school.students.active
    else
      @current_educator.students_for_school_overview
    end
  end

  # This should always find a record, but if it doesn't we fall back to the
  # raw query.
  # Results an array of student_hashes.
  def load_precomputed_student_hashes(time_now, authorized_student_ids)
    begin
      # the precompute job runs at 8am UTC, and takes a few minutes to run,
      # so keep a buffer that makes sure the import task and precompute job
      # can finish before cutting over to the next day.
      query_time = time_now - 9.hours
      key = precomputed_student_hashes_key(query_time, authorized_student_ids)
      Rails.logger.warn "load_precomputed_student_hashes querying key: #{key}..."
      doc = PrecomputedQueryDoc.find_by_key(key)
      return parse_hashes_from_doc(doc) unless doc.nil?
    rescue ActiveRecord::StatementInvalid => err
      Rails.logger.error "load_precomputed_student_hashes raised error #{err.inspect}"
    end

    # Fallback to performing the full query if something went wrong reading the
    # precomputed value
    Rails.logger.error "falling back to full load_precomputed_student_hashes query for key: #{key}"
    authorized_students = Student.find(authorized_student_ids)
    authorized_students.map {|student| student_hash_for_slicing(student) }
  end

  def parse_hashes_from_doc(doc)
    JSON.parse(doc.json).deep_symbolize_keys![:student_hashes]
  end

  # Used to wrap a block with timing measurements and logging, returning the value of the
  # block.
  #
  # Example: students = log_timing('load students') { Student.all }
  # Outputs: log_timing:end [load students] 2998ms
  def log_timing(message)
    return_value = nil

    Rails.logger.info "log_timing:start [#{message}]"
    timing_ms = Benchmark.ms { return_value = yield }
    Rails.logger.info "log_timing:end [#{message}] #{timing_ms.round}ms"

    return_value
  end

end
