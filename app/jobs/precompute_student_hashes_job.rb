class PrecomputeStudentHashesJob
  include StudentsQueryHelper

  # Runs the job for a particular day, querying for all educators' authorizations,
  # precomputing the `student_hashes` for them and writing them to the database.
  def precompute_all!(date_timestamp)
    puts 'Querying for jobs...'
    jobs = school_overview_precompute_jobs(date_timestamp)
    puts "Found #{jobs.size} jobs."

    puts 'Starting precomputing...'
    jobs.each_with_index do |job, index|
      precompute_and_write_student_hashes!(job[:date_timestamp], job[:authorized_student_ids])
      puts "Wrote document #{index+1}..."
    end
    puts 'Done.'
  end

  private
  def school_overview_precompute_jobs(date_timestamp)
    all_jobs = Educator.all.map do |educator|
      {
        date_timestamp: date_timestamp,
        authorized_student_ids: educator.students_for_school_overview.map(&:id)
      }
    end
    all_jobs.uniq
  end

  def precompute_and_write_student_hashes!(date_timestamp, authorized_student_ids)
    precomputed_time = Time.at(date_timestamp)
    authorized_students = Student.find(authorized_student_ids)
    student_hashes = authorized_students.map {|student| student_hash_for_slicing(student) }
    key = precomputed_student_hashes_key(precomputed_time, authorized_student_ids)

    # This is a non-atomic upsert
    PrecomputedQueryDoc.find(key).destroy! if PrecomputedQueryDoc.exists?(key)
    PrecomputedQueryDoc.create!(key: key, json: { student_hashes: student_hashes }.to_json )
  end
end