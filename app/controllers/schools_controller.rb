class SchoolsController < ApplicationController

  before_action :authenticate_admin!      # Defined in ApplicationController.

  def show
    @serialized_data = {
      students: Student.serialized_data,
      intervention_types: InterventionType.all
    }
  end

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
    use_fixtures = false      # Toggle between using demo development data
                              # and real data loaded in as a JSON fixture
    time_now = Time.now
    @serialized_data = {
      :students_with_star_reading => students_with_star_reading(time_now, false),
      :intervention_types => InterventionType.all
    }
  end

  private

  def students_with_star_reading(time_now, use_fixtures)
    return IO.read("#{Rails.root}/data/students_with_star_reading.json") if use_fixtures

    sliceable_student_hashes(time_now, Student.all.includes(:assessments)) do |student|
      student.as_json.merge(star_reading_results: student.star_reading_results.as_json)
    end
  end

  def overview_student_hashes(time_now)
    sliceable_student_hashes(time_now, Student.all)
  end


  def current_school_year
    DateToSchoolYear.new(Time.new).convert
  end

  def sliceable_student_hashes(time_now, students_assoc)
    # Takes a lazy collection that has any eager includes needed, and yields each `student`
    # to a block that returns a hash representation of the student and data from the eager
    # includes.
    current_school_year = DateToSchoolYear.new(time_now).convert
    students_assoc.includes(:interventions, :discipline_incidents).map do |student|
      yield(student).merge({
        :interventions => student.interventions.as_json,
        :student_risk_level => student.student_risk_level.as_json,
        :discipline_incidents_count => student.discipline_incidents.select do |incident|
          incident.school_year == current_school_year
        end.size
      })
    end
  end

  # remove sensitive-ish fields
  def clean_student_hash(student_hash)
    student_hash.except(:address).merge({
      first_name: ["Aladdin", "Chip", "Daisy", "Mickey", "Minnie", "Donald", "Elsa", "Mowgli", "Olaf", "Pluto", "Pocahontas", "Rapunzel", "Snow", "Winnie"].sample,
      last_name: ["Disney", "Duck", "Kenobi", "Mouse", "Pan", "Poppins", "Skywalker", "White"].sample
    })
  end

end
