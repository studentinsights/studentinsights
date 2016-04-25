class StudentsController < ApplicationController
  include SerializeDataHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :redirect_unauthorized!

  before_action :authorize!, except: [:names]

  def authorize!
    student = Student.find(params[:id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def show
    student = Student.find(params[:id])
    chart_data = StudentProfileChart.new(student).chart_data

    @serialized_data = {
      current_educator: current_educator,
      student: serialize_student_for_profile(student),
      feed: student_feed(student),
      chart_data: chart_data,
      dibels: student.student_assessments.by_family('DIBELS'),
      intervention_types_index: intervention_types_index,
      service_types_index: service_types_index,
      event_note_types_index: event_note_types_index,
      educators_index: Educator.to_index,
      access: student.latest_access_results,
      attendance_data: student_profile_attendance_data(student)
    }
  end

  def sped_referral
    set_up_sped_data
    respond_to do |format|
      format.pdf do
        render pdf: "sped_referral"
      end
    end
  end

  # post
  def event_note
    clean_params = params.require(:event_note).permit(*[
      :student_id,
      :event_note_type_id,
      :text
    ])
    event_note = EventNote.new(clean_params.merge({
      educator_id: current_educator.id,
      recorded_at: Time.now
    }))
    if event_note.save
      render json: serialize_event_note(event_note)
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  # post
  def service
    clean_params = params.require(:service).permit(*[
      :student_id,
      :service_type_id,
      :date_started,
      :provided_by_educator_name
    ])
    service = Service.new(clean_params.merge({
      recorded_by_educator_id: current_educator.id,
      recorded_at: Time.now
    }))
    if service.save
      render json: serialize_service(service)
    else
      render json: { errors: service.errors.full_messages }, status: 422
    end
  end

  # Used by the search bar to query for student names
  def names
    q = params[:q]
    authorized_students = Student.with_school.select do |student|
      current_educator.is_authorized_for_student(student)
    end
    sorted_students = search_and_score(q, authorized_students)
    @sorted_results = sorted_students.map {|student| student.decorate.presentation_for_autocomplete }

    respond_to do |format|
      format.json { render json: @sorted_results }
    end
  end

  private

  def student_profile_attendance_data(student)
    student_school_years = student.student_school_years
    {
      discipline_incidents: flatmap_and_sort(student_school_years) {|year| year.discipline_incidents },
      tardies: flatmap_and_sort(student_school_years) {|year| year.tardies },
      absences: flatmap_and_sort(student_school_years) {|year| year.absences }
    }
  end

  # Takes a list of student_school_years, yields each one to the block provided, then flattens
  # and sorts the results.
  def flatmap_and_sort(student_school_years)
    student_school_years.map do |student_school_year|
      yield student_school_year
    end.flatten.sort_by(&:occurred_at).reverse
  end

  def serialize_student_for_profile(student)
    student.as_json.merge({
      student_risk_level: student.student_risk_level.as_json,
      absences_count: student.most_recent_school_year.absences.count,
      tardies_count: student.most_recent_school_year.tardies.count,
      school_name: student.try(:school).try(:name),
      homeroom_name: student.try(:homeroom).try(:name),
      discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count
    }).stringify_keys
  end

  def search_and_score(query, students)
    search_tokens = query.split(' ')
    students_with_scores = students.flat_map do |student|
      score = calculate_student_score(student, search_tokens)
      if score > 0 then [{ student: student, score: score }] else [] end
    end

    students_with_scores.sort_by {|ss| -1 * ss[:score] }.map {|ss| ss[:student] }
  end

  # range: [0.0, 1.0]
  def calculate_student_score(student, search_tokens)
    student_tokens = [student.first_name, student.last_name].compact

    search_token_scores = []
    search_tokens.each do |search_token|
      student_tokens.each do |student_token|
        if search_token.upcase == student_token[0..search_token.length - 1].upcase
          search_token_scores << 1
          break
        end
      end
    end

    (search_token_scores.sum.to_f / search_tokens.length)
  end

  # The feed of mutable data that changes most frequently and is owned by Student Insights
  def student_feed(student)
    {
      event_notes: student.event_notes.map {|event_note| serialize_event_note(event_note) },
      services: {
        active: student.services.active.map {|service| serialize_service(service) },
        discontinued: student.services.discontinued.map {|service| serialize_service(service) }
      },
      deprecated: {
        interventions: student.interventions.map { |intervention| serialize_intervention(intervention) }
      }
    }
  end

  def set_up_sped_data
    @student = Student.find(params[:id])
    @current_educator = current_educator
    @url = root_url.chomp('/') + request.path
    @services = @student.services
    @current_school_year = DateToSchoolYear.new(Date.today).convert.name
    @student_school_years = @student.student_school_years.includes(:absences).includes(:tardies).includes(:discipline_incidents)
    @discipline_incidents = @student_school_years.flat_map(&:discipline_incidents).sort_by(&:occurred_at)
    @student_assessments = @student.student_assessments.includes(:assessment)
  end
end
