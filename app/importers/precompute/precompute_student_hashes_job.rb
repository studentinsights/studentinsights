class PrecomputeStudentHashesJob < Struct.new :log
  include StudentsQueryHelper

  # Runs the job for a particular day, querying for all educators' authorizations,
  # precomputing the `student_hashes` for them and writing them to the database.
  def precompute_all!
    log.puts 'Querying for jobs...'
    jobs = school_overview_precompute_jobs
    log.puts "Found #{jobs.size} jobs."

    log.puts 'Starting precomputing...'
    jobs.each_with_index do |job, index|
      precompute_and_write_student_hashes!(job)
      log.puts "Wrote document #{index+1}..."
    end
    log.puts 'Done.'
  end

  private

  def school_overview_precompute_jobs
    Educator.all.order(:id).flat_map { |educator| educator_to_jobs(educator) }.uniq
  end

  # Educators with district-wide access will have different authorization
  # for each school than other users.
  def educator_to_jobs(educator)
    if educator.districtwide_access?
      return School.all.map do |school|
        {
          authorized_student_ids: school.students.active.map(&:id)
        }
      end
    end

    student_ids = educator.students_for_school_overview.map(&:id)
    return [] if student_ids.size == 0
    return [{ authorized_student_ids: student_ids }]
  end

  def precompute_and_write_student_hashes!(authorized_student_ids)
    # compute
    authorized_students = Student.where(id: authorized_student_ids)
    student_hashes = authorized_students.map {|student| student_hash_for_slicing(student) }

    # write
    create_document!(authorized_student_ids, student_hashes)

    nil
  end

  def create_document!(authorized_student_ids, student_hashes)
    key = PrecomputedQueryDoc.precomputed_student_hashes_key(authorized_student_ids)
    authorized_students_digest = PrecomputedQueryDoc.authorized_students_digest(authorized_student_ids)
    begin
      PrecomputedQueryDoc.create!(
        key: key,
        json: json_hash.to_json,
        authorized_students_digest: authorized_students_digest
      )
    rescue => error
      Rollbar.error('PrecomputeStudentHashesJob#create_document!', error, { key: key })
      log.puts "create_document! failed for key: #{key}"
      nil
    end
  end
end
