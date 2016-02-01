class SchoolsController < ApplicationController

  before_action :authenticate_admin!      # Defined in ApplicationController.

  def show
    @serialized_data = {
      students: eager_students().map {|student| fat_student_hash(student) },
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end

  def star_reading
    @serialized_data = {
      students_with_star_reading: students_with_star_reading,
      current_educator: current_educator,
      intervention_types: InterventionType.all
    }
  end

  private
  def students_with_star_reading
    eager_students(:student_assessments).map do |student|
      fat_student_hash(student).merge(star_reading_results: student.star_reading_results)
    end
  end

  # Eager includes for querying students to product a fat student hash.
  def eager_students(*additional_includes)
    Student.all.includes([
      :interventions,
      :student_risk_level,
      :homeroom,
      :student_school_years
    ] + additional_includes)
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    student.as_json.merge({
      interventions: student.interventions,
      student_risk_level: student.student_risk_level.as_json,
      discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count,
      absences_count: student.most_recent_school_year.absences.count,
      tardies_count: student.most_recent_school_year.tardies.count,
      homeroom_name: student.try(:homeroom).try(:name)
    })
  end
end
