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
    @serialized_student_data = @student.serialized_student_data

    @chart_start = params[:chart_start] || "mcas-growth"
    @chart_data = StudentProfileChart.new(@serialized_student_data).chart_data

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
        render csv: StudentProfileCsvExporter.new(@serialized_student_data).profile_csv_export,
        filename: 'export'
      }
      format.pdf { render text: PDFKit.new(@student_url).to_pdf }
    end
  end

  # TODO(kr) clarify serialized_data in student.rb, why both and how used
  # TODO(kr) can simplify chart_data later
  def profile
    student = Student.find(params[:id])
    @serialized_data = {
      current_educator: current_educator,
      student: student.serialized_data,
      notes: student.student_notes.map { |note| serialize_student_note(note) },
      feed: student_feed(student),
      chart_data: StudentProfileChart.new(student.serialized_student_data).chart_data,
      intervention_types_index: intervention_types_index,
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
    @q = params[:q].upcase
    @length = @q.length

    @matches = Student.with_school.select do |s|
      first_name = s.first_name[0..@length - 1].upcase if s.first_name.present?
      last_name = s.last_name[0..@length - 1].upcase if s.last_name.present?
      first_name == @q || last_name == @q
    end

    @result = @matches.map { |student| student.decorate.presentation_for_autocomplete }

    respond_to do |format|
      format.json { render json: @result }
    end
  end

  private
  def not_authorized
    redirect_to not_authorized_path
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
