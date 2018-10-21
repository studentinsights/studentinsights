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
      precompute_and_write_doc!(job)
      log.puts "Wrote document #{index+1}..."
    end
    log.puts 'Done.'
    nil
  end

  private
  def school_overview_precompute_jobs
    Educator.all.order(:id).flat_map { |educator| jobs_for_educator(educator) }.uniq
  end

  # Educators may have access to this for multiple schools, and with different
  # sets of students within each school.
  def jobs_for_educator(educator)
    jobs = []
    authorizer = Authorizer.new(educator)
    School.all.each do |school|
      # Skip if they're not authorized for the school
      next unless authorizer.is_authorized_for_school?(school)
    
      # Skip if they're not authorized for any students within that school
      authorized_students = authorizer.authorized { school.students.active.to_a }
      next unless authorized_students.size > 0
      
      # Add a job for students that we need to compute for them within that school
      jobs << { authorized_student_ids: authorized_students.map(&:id) }
    end
    jobs
  end

  def precompute_and_write_doc!(job)
    authorized_student_ids = job[:authorized_student_ids]
    
    # compute
    authorized_students = Student.where(id: authorized_student_ids)
    student_hashes = authorized_students.map {|student| student_hash_for_slicing(student) }

    # write
    create_document!(authorized_student_ids, student_hashes)
  end

  def create_document!(authorized_student_ids, student_hashes)
    key = PrecomputedQueryDoc.precomputed_student_hashes_key(authorized_student_ids)
    authorized_students_digest = PrecomputedQueryDoc.authorized_students_digest(authorized_student_ids)
    json_string = { student_hashes: student_hashes }.to_json
    begin
      PrecomputedQueryDoc.create!(
        key: key,
        json: json_string,
        authorized_students_digest: authorized_students_digest
      )
    rescue => error
      Rollbar.error('PrecomputeStudentHashesJob#create_document!', error, { key: key })
      log.puts "create_document! failed for key: #{key}"
      nil
    end
  end
end
