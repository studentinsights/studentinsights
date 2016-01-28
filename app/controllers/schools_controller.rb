class SchoolsController < ApplicationController

  before_action :authenticate_admin!      # Defined in ApplicationController.

  def show
    use_fixtures = false
    students = if use_fixtures then DevelopmentFixtures.new.students_show else Student.serialized_data end

    @serialized_data = {
      students: students,
      intervention_types: InterventionType.all
    }
  end

  # TODO(kr) deprecated
  def students
    @school = School.friendly.find(params[:id])
    attendance_queries = AttendanceQueries.new(@school)
    mcas_queries = McasQueries.new(@school)

    @top_absences = attendance_queries.top_5_absence_concerns_serialized
    @top_tardies = attendance_queries.top_5_tardy_concerns_serialized
    @top_mcas_math_concerns = mcas_queries.top_5_math_concerns_serialized
    @top_mcas_ela_concerns = mcas_queries.top_5_ela_concerns_serialized
  end

  # To build local fixtures from production data:
  # copy body of controller code into Rails console, run the code in the body of this method,
  # print it as JSON and then save it in the /data/schools/star_reading
  def star_reading
    # Toggle between using demo development data and real data loaded in as a JSON fixture
    use_fixtures = false
    students_with_star_reading = if use_fixtures then DevelopmentFixtures.new.students_star_reading else students_with_star_reading() end

    @serialized_data = {
      :students_with_star_reading => students_with_star_reading,
      :intervention_types => InterventionType.all
    }
  end

  private
  def students_with_star_reading
    sliceable_student_hashes(Student.all.includes(:assessments)) do |student|
      student.as_json.merge(star_reading_results: student.star_reading_results.as_json)
    end
  end

  def sliceable_student_hashes(students_assoc)
    # Takes a lazy collection that has any eager includes needed, and yields each `student`
    # to a block that returns a hash representation of the student and data from the eager
    # includes.
    students_assoc.includes(:interventions).map do |student|
      yield(student).merge({
        :interventions => student.interventions.as_json,
        :student_risk_level => student.student_risk_level.as_json,
        :discipline_incidents_count => student.most_recent_school_year.discipline_incidents.count
      })
    end
  end
end
