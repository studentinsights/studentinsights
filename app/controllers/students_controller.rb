class StudentsController < ApplicationController
  include SerializeDataHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :not_authorized

  before_action :authorize!, only: [:show]

  def authorize!
    student = Student.find(params[:id])
    educator = current_educator
    raise Exceptions::EducatorNotAuthorized unless educator.is_authorized_for_student(student)
  end

  def show
    @student = Student.find(params[:id]).decorate
    @chart_start = params[:chart_start] || "mcas-growth"
    @chart_data = StudentProfileChart.new(@student).chart_data

    @student_risk_level = @student.student_risk_level.decorate

    @student_school_years = @student.student_school_years.includes(
      :discipline_incidents,
      :student_assessments,
      :interventions
    )

    interventions = @student.interventions.order(start_date: :desc)
    @serialized_interventions = interventions.map { |intervention| serialize_intervention(intervention) }

    student_notes = @student.student_notes
    @serialized_student_notes = student_notes.map { |note| serialize_student_note(note) }

    @roster_url = homeroom_path(@student.homeroom)
    @csv_url = student_path(@student) + ".csv"

    respond_to do |format|
      format.html
      format.csv {
        render csv: StudentProfileCsvExporter.new(@student).profile_csv_export,
        filename: 'export'
      }
    end
  end

  # TODO(kr) clarify serialized_data in student.rb, why both and how used
  # TODO(kr) can simplify chart_data later
  def profile
    student = Student.find(params[:id])
    chart_data = StudentProfileChart.new(student).chart_data
    @serialized_data = {
      current_educator: current_educator,
      student: student.serialized_data,
      notes: student.student_notes.map { |note| serialize_student_note(note) },
      feed: student_feed(student),
      chart_data: chart_data,
      intervention_types_index: intervention_types_index,
      educators_index: educators_index,
      attendance_data: {
        discipline_incidents: student.most_recent_school_year.discipline_incidents,
        tardies: student.most_recent_school_year.tardies,
        absences: student.most_recent_school_year.absences
      }
    }
  end

  def sped_referral
    @student = Student.find(params[:id])
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
      render json: event_note.as_json
    else
      render json: { errors: event_note.errors.full_messages }, status: 422
    end
  end

  def names
    q = params[:q]
    sorted_students = search_and_score(q, Student.with_school)
    @sorted_results = sorted_students.map {|student| student.decorate.presentation_for_autocomplete }

    respond_to do |format|
      format.json { render json: @sorted_results }
    end
  end

  private
  def not_authorized
    redirect_to not_authorized_path
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

  def serialize_student_for_profile(student)
    {
      student: student,
      student_assessments: student.student_assessments,
      star_math_results: student.star_math_results,
      star_reading_results: student.star_reading_results,
      mcas_mathematics_results: student.mcas_mathematics_results,
      mcas_ela_results: student.mcas_ela_results,
      absences_count_by_school_year: student.student_school_years.map {|year| year.absences.length },
      tardies_count_by_school_year: student.student_school_years.map {|year| year.tardies.length },
      discipline_incidents_by_school_year: student.student_school_years.map {|year| year.discipline_incidents.length },
      school_year_names: student.student_school_years.pluck(:name),
      interventions: student.interventions
    }
  end

  # TODO(kr) this is placeholder fixture data for now, to test design prototypes on the v2 student profile
  # page
  def student_feed(student)
    {
      v1_notes: student.student_notes.map { |note| serialize_student_note(note) },
      v1_interventions: student.interventions.map { |intervention| serialize_intervention(intervention) },
      event_notes: student.event_notes,
      v2_services: if Rails.env.development? then v2_services_fixture else [] end
    }
  end

  def v2_services_fixture
    fixture_educator_id = 1
    [
      { version: 'v2', id: 133, profile_v2_service_type_id: 1, recorded_by_educator_id: fixture_educator_id, assigned_to_educator_id: fixture_educator_id, start_date: '2016-02-09T20:56:51.638Z', end_date: nil, text: 'Working on goals' },
      { version: 'v2', id: 134, profile_v2_service_type_id: 1, recorded_by_educator_id: fixture_educator_id, assigned_to_educator_id: fixture_educator_id, start_date: '2016-02-09T20:56:51.638Z', end_date: nil, text: ''  }
    ]
  end
end
