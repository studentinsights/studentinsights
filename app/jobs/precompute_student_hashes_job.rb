class PrecomputeStudentHashesJob < Struct.new :log
  include StudentsQueryHelper

  # Runs the job for a particular day, querying for all educators' authorizations,
  # precomputing the `student_hashes` for them and writing them to the database.
  def precompute_all!(date_timestamp)
    log.puts 'Querying for jobs...'
    jobs = school_overview_precompute_jobs(date_timestamp)
    log.puts "Found #{jobs.size} jobs."

    log.puts 'Starting precomputing...'
    jobs.each_with_index do |job, index|
      precompute_and_write_student_hashes!(job[:date_timestamp], job[:authorized_student_ids])
      log.puts "Wrote document #{index+1}..."
    end
    log.puts 'Done.'
  end

  private

  def school_overview_precompute_jobs(date_timestamp)
    Educator.all.flat_map { |educator| educator_to_jobs(educator, date_timestamp) }.uniq
  end

  # Educators with district-wide access will have different authorization
  # for each school than other users.
  def educator_to_jobs(educator, date_timestamp)
    if educator.districtwide_access?
      return School.all.map do |school|
        {
          date_timestamp: date_timestamp,
          authorized_student_ids: school.students.active.map(&:id)
        }
      end
    end

    student_ids = educator.students_for_school_overview.map(&:id)
    return [] if student_ids.size == 0
    return [{
      date_timestamp: date_timestamp,
      authorized_student_ids: educator.students_for_school_overview.map(&:id)
    }]
  end

  def precompute_and_write_student_hashes!(date_timestamp, authorized_student_ids)
    precomputed_time = Time.at(date_timestamp)
    authorized_students = Student.find(authorized_student_ids)
    student_hashes = authorized_students.map {|student| student_hash_for_slicing(student) }
    key = precomputed_student_hashes_key(precomputed_time, authorized_student_ids)

    # This is a non-atomic upsert
    pre_existing_doc = PrecomputedQueryDoc.find_by_key(key)
    pre_existing_doc.destroy! if pre_existing_doc.present?
    PrecomputedQueryDoc.create!(key: key, json: { student_hashes: student_hashes }.to_json )
  end
end
