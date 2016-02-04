class StudentsController < ApplicationController
  include SerializeDataHelper

  rescue_from Exceptions::EducatorNotAuthorized, with: :not_authorized

  before_action :authorize!, only: [:show]

  def authorize!
    student = Student.find(params[:id])

    allowed_conditions = [
      current_educator.schoolwide_access,                       # <= Schoolwide admin
      student.grade.in?(current_educator.grade_level_access),   # <= Grade level access
      student.in?(current_educator.students)                    # <= Homeroom level access
    ]

    raise Exceptions::EducatorNotAuthorized unless allowed_conditions.any?
  end

  def show
    @student = Student.find(params[:id])
    @presenter = StudentPresenter.new(@student)
    @serialized_student_data = @student.serialized_student_data

    @chart_start = params[:chart_start] || "mcas-growth"
    @chart_data = StudentProfileChart.new(@serialized_student_data).chart_data

    @student_risk_level = @student.student_risk_level
    @level = @student_risk_level.level

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

  def names
    @q = params[:q].upcase
    @length = @q.length
    @matches = Student.with_school.select do |s|
      first_name = s.first_name[0..@length - 1].upcase if s.first_name.present?
      last_name = s.last_name[0..@length - 1].upcase if s.last_name.present?
      first_name == @q || last_name == @q
    end
    @result = @matches.map do |m|
      {
        label: "#{StudentPresenter.new(m).full_name} - #{m.school.local_id} - #{m.grade}",
        value: m.id
      }
    end
    respond_to do |format|
      format.json { render json: @result }
    end
  end

  def not_authorized
    redirect_to not_authorized_path
  end

end
