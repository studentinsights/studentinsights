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
    @student_url = student_path(@student)

    respond_to do |format|
      format.html
      format.csv {
        render csv: StudentProfileCsvExporter.new(@student).profile_csv_export,
        filename: 'export'
      }
      format.pdf { render text: PDFKit.new(@student_url).to_pdf }
    end
  end

  def profile
    student = Student.find(params[:id])
    chart_data = StudentProfileChart.new(student).chart_data
    @serialized_data = {
      current_educator: current_educator,
      student: serialize_student_for_profile(student),
      notes: student.student_notes.map { |note| serialize_student_note(note) },
      feed: student_feed(student),
      chart_data: chart_data,
      intervention_types_index: intervention_types_index,
      service_types_index: fixture_service_types_index, # TODO(kr) implement this as part of the backend work
      educators_index: educators_index,
      attendance_data: {
        discipline_incidents: student.most_recent_school_year.discipline_incidents,
        tardies: student.most_recent_school_year.tardies,
        absences: student.most_recent_school_year.absences
      }
    }
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

  def serialize_student_for_profile(student)
    student.as_json.merge({
      interventions: student.interventions.as_json,
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

  # TODO(kr) this has some placeholder fixture data for now, to test design prototypes on the v2 student profile
  # page
  def student_feed(student)
    {
      event_notes: student.event_notes,
      services: if Rails.env.development? then fixture_services else [] end,
      deprecated: {
        notes: student.student_notes.map { |note| serialize_student_note(note) },
        interventions: student.interventions.map { |intervention| serialize_intervention(intervention) }
      }
    }
  end

  # TODO(kr) temporary, until building backend tables
  def fixture_service_types_index
    {
      502 => { id: 502, name: 'Attendance Officer' },
      503 => { id: 503, name: 'Attendance Contract' },
      504 => { id: 504, name: 'Behavior Contract' },
      505 => { id: 505, name: 'Counseling, in-house' },
      506 => { id: 506, name: 'Counseling, outside' },
      507 => { id: 507, name: 'Reading intervention' },
      508 => { id: 508, name: 'Math intervention' }
    }
  end

  # Merges 'event_notes' table with 'discontinued_event_notes' to
  # present the current view of what's active and what's been discontinued.
  def fixture_services
    fixture_educator_id = 1
    [{
      id: 133,
      service_type_id: 503,
      recorded_by_educator_id: fixture_educator_id,
      assigned_to_educator_id: fixture_educator_id,
      date_started: '2016-02-09',
      date_discontinued: nil,
      discontinued_by_educator_id: fixture_educator_id
    }, {
      id: 134,
      service_type_id: 506,
      recorded_by_educator_id: fixture_educator_id,
      assigned_to_educator_id: fixture_educator_id,
      date_started: '2016-02-08',
      date_discontinued: nil,
      discontinued_by_educator_id: fixture_educator_id
    }]
  end
end
