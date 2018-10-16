# Store a historical data point about levels for SHS students
class HistoricalLevelsSnapshot < ApplicationRecord
  def self.snapshot!(options = {})
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_levels?    
    school_id = options.fetch(:school_id, 'SHS')
    time_now = options.fetch(:time_now, Time.now)
    log = options.fetch(:log, STDOUT)
    

    levels = SomervilleHighLevels.new
    students = Student.active.where(school_id: school_ids)
    students_with_levels_json = levels.unsafe_students_with_levels_json(students, time_now)
    HistoricalLevelsSnapshot.create!({
      time_now: time_now,
      student_ids: students.map(&:id),
      students_with_levels_json: students_with_levels_json
    })
  end
end
