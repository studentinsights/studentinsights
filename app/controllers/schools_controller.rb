class SchoolsController < ApplicationController

  before_action :authenticate_admin!      # Defined in ApplicationController.

  def show
    @serialized_data = {
      students: fat_student_hashes(Student.all),
      intervention_types: InterventionType.all
    }
  end

  def star_reading
    @serialized_data = {
      :students_with_star_reading => students_with_star_reading,
      :intervention_types => InterventionType.all
    }
  end

  private
  def students_with_star_reading
    fat_student_hashes(Student.all.includes(:assessments)) do |student|
      student.as_json.merge(star_reading_results: student.star_reading_results.as_json)
    end
  end

  # Takes a lazy collection that has any eager includes needed, and mixes in several other fields
  # that are used to perform filtering and slicing of students in the UI.
  # An optional block can be passed that yields each `student`, for merging in other fields
  # that rely on methods defined on the Student model.
  def fat_student_hashes(students_assoc)
    students_assoc.includes(:interventions).map do |student|
      student_hash = if block_given? then yield(student) else student.as_json end
      student_hash.merge({
        interventions: student.interventions.as_json,
        student_risk_level: student.student_risk_level.as_json,
        discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count,
        absences_count: student.most_recent_school_year.absences.count,
        tardies_count: student.most_recent_school_year.tardies.count,
        homeroom_name: student.try(:homeroom).try(:name)
      })
    end
  end
end
